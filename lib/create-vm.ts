const {
  ClientSecretCredential,
  DefaultAzureCredential,
} = require("@azure/identity");
const { ComputeManagementClient } = require("@azure/arm-compute");
const { ResourceManagementClient } = require("@azure/arm-resources");
const { StorageManagementClient } = require("@azure/arm-storage");
const { NetworkManagementClient } = require("@azure/arm-network");

// Store function output to be used elsewhere
let randomIds = {};
let subnetInfo = null;
let publicIPInfo = null;
let vmImageInfo = null;
let nicInfo = null;

// CHANGE THIS - used as prefix for naming resources
const yourAlias = "cloudgre";
const storageAccountName = "storagegreneche";

// CHANGE THIS - used to add tags to resources
const projectName = "azure-samples-create-vm";

// Resource configs
const location = "francecentral";
const accType = "Standard_LRS";

// config for VM
var publisher = "";
var offer = "";
var sku = "";
const adminUsername = "hello";
const adminPassword = "Helloo1!";
const ipAdress = "10.10.10.10";

const ubuntu = {
	publisher: "Canonical",
  	offer: "UbuntuServer",
  	sku: "16.04.0-LTS",
	version: "latest",
};

const debian = {
	publisher: "credativ",
  	offer: "Debian",
  	sku: "9",
	version: "latest",
};

const windows = {
	publisher: "MicrosoftWindowsServer",
  	offer: "WindowsServer",
  	sku: "2019-Datacenter",
	version: "latest",
};

// Azure authentication in environment variables for DefaultAzureCredential
const tenantId =
  process.env.AZURE_TENANT_ID || "tenant_id";
const clientId =
  process.env.AZURE_CLIENT_ID || "client_id";
const secret =
  process.env.AZURE_CLIENT_SECRET || "client_secret";
const subscriptionId =
  process.env.AZURE_SUBSCRIPTION_ID || "subscription_id";

const credentials = new ClientSecretCredential(tenantId, clientId, secret);
// Azure services
const resourceClient = new ResourceManagementClient(
  credentials,
  subscriptionId
);
const computeClient = new ComputeManagementClient(credentials, subscriptionId);
const storageClient = new StorageManagementClient(credentials, subscriptionId);
const networkClient = new NetworkManagementClient(credentials, subscriptionId);

// Create resources then manage them (on/off)
async function createResources(os_machine: string) {
  try {
    const result = await createResourceGroup();
    const accountInfo = await createStorageAccount();
    const vnetInfo = await createVnet();
    const subnetInfo = await getSubnetInfo();
    const publicIPInfo = await createPublicIP();
    const nicInfo = await createNIC(subnetInfo, publicIPInfo);
    const nicResult = await getNICInfo();
    const vmInfo = await createVirtualMachine(nicInfo.id, os_machine);
	setTimeout(() => {
		console.log("Timer exceeded, now deleting resources");
		deleteResourceGroup();
	}, 90000);
    return JSON.stringify({
      "username":adminUsername,
      "password":adminPassword,
      "ipAddr":ipAdress,
    });
  } catch (err) {
    console.log(err);
    deleteResourceGroup();
    return err;
  }
}

async function createResourceGroup() {
  console.log("\n1.Creating resource group: " + resourceGroupName);
  const groupParameters = {
    location: location,
    tags: { project: projectName },
  };
  const resCreate = await resourceClient.resourceGroups.createOrUpdate(
    resourceGroupName,
    groupParameters
  );
  return resCreate;
}

async function createStorageAccount() {
  console.log("\n2.Creating storage account: " + storageAccountName);
  const createParameters = {
    location: location,
    sku: {
      name: accType,
    },
    kind: "Storage",
    tags: {
      project: projectName,
    },
  };
  return await storageClient.storageAccounts.beginCreateAndWait(
    resourceGroupName,
    storageAccountName,
    createParameters
  );
}

async function createVnet() {
  console.log("\n3.Creating vnet: " + vnetName);
  const vnetParameters = {
    location: location,
    addressSpace: {
      addressPrefixes: ["10.0.0.0/16"],
    },
    dhcpOptions: {
      dnsServers: ["10.1.1.1", "10.1.2.4"],
    },
    subnets: [{ name: subnetName, addressPrefix: "10.0.0.0/24" }],
  };
  return await networkClient.virtualNetworks.beginCreateOrUpdateAndWait(
    resourceGroupName,
    vnetName,
    vnetParameters
  );
}

async function getSubnetInfo() {
  console.log("\nGetting subnet info for: " + subnetName);
  const getResult = await networkClient.subnets.get(
    resourceGroupName,
    vnetName,
    subnetName
  );
  return getResult;
}

async function createPublicIP() {
  console.log("\n4.Creating public IP: " + publicIPName);
  const publicIPParameters = {
    location: location,
    publicIPAllocationMethod: "Dynamic",
    dnsSettings: {
      domainNameLabel: domainNameLabel,
    },
  };
  return await networkClient.publicIPAddresses.beginCreateOrUpdateAndWait(
    resourceGroupName,
    publicIPName,
    publicIPParameters
  );
}

async function createNIC(subnetInfo: any, publicIPInfo: any) {
  console.log("\n5.Creating Network Interface: " + networkInterfaceName);
  const nicParameters = {
    location: location,
    ipConfigurations: [
      {
        name: ipConfigName,
        privateIPAllocationMethod: "Dynamic",
        subnet: subnetInfo,
        publicIPAddress: publicIPInfo,
      },
    ],
  };
  return await networkClient.networkInterfaces.beginCreateOrUpdateAndWait(
    resourceGroupName,
    networkInterfaceName,
    nicParameters
  );
}

async function getNICInfo() {
  return await networkClient.networkInterfaces.get(
    resourceGroupName,
    networkInterfaceName
  );
}

async function createVirtualMachine(nicId: any, os_machine = "ubuntu") {
  switch (os_machine) {
	case "ubuntu":
	  publisher = ubuntu.publisher;
	  offer = ubuntu.offer;
	  sku = ubuntu.sku;
	  break;
	case "debian":
	  publisher = debian.publisher;
	  offer = debian.offer;
	  sku = debian.sku;
	  break;
	case "windows":
	  publisher = windows.publisher;
	  offer = windows.offer;
	  sku = windows.sku;
	  break;
	default:
	  publisher = ubuntu.publisher;
	  offer = ubuntu.offer;
	  sku = ubuntu.sku;
  }
  const vmParameters = {
    location: location,
    osProfile: {
      computerName: vmName,
      adminUsername: adminUsername,
      adminPassword: adminPassword,
    },
    hardwareProfile: {
      vmSize: "Standard_B1ls",
    },
    storageProfile: {
      imageReference: {
        publisher: publisher,
        offer: offer,
        sku: sku,
        version: "latest",
      },
      osDisk: {
        name: osDiskName,
        caching: "None",
        createOption: "fromImage",
        vhd: {
          uri:
            "https://" +
            storageAccountName +
            ".blob.core.windows.net/nodejscontainer/osnodejslinux.vhd",
        },
      },
    },
    networkProfile: {
      networkInterfaces: [
        {
          id: nicId,
          primary: true,
        },
      ],
    },
  };
  console.log("6.Creating Virtual Machine: " + vmName);
  const resCreate = await computeClient.virtualMachines.beginCreateOrUpdateAndWait(
    resourceGroupName,
    vmName,
    vmParameters
  );
  return await computeClient.virtualMachines.get(
    resourceGroupName,
    vmName
  );
}

const _generateRandomId = (prefix: string | number, existIds: {}) => {
  var newNumber;
  while (true) {
    newNumber = String(prefix) + Math.floor(Math.random() * 10000);
    if (!existIds || !(newNumber in existIds)) {
      break;
    }
  }
  return newNumber;
};

async function deleteResourceGroup() {
  // Create Azure SDK client for Resource Management such as resource groups
  const resourceClient = new ResourceManagementClient(
    credentials,
    subscriptionId
  );

  const result = await resourceClient.resourceGroups.beginDelete(resourceGroupName).then(() => {
    console.log("Resource group " + resourceGroupName + " has been deleted.");
  });

}

//Random number generator for service names and settings
const resourceGroupName = yourAlias + "rg";
const vmName = _generateRandomId(`${yourAlias}vm`, randomIds);
const vnetName = _generateRandomId(`${yourAlias}vnet`, randomIds);
const subnetName = _generateRandomId(`${yourAlias}subnet`, randomIds);
const publicIPName = _generateRandomId(`${yourAlias}pip`, randomIds);
const networkInterfaceName = _generateRandomId(`${yourAlias}nic`, randomIds);
const ipConfigName = _generateRandomId(`${yourAlias}crpip`, randomIds);
const domainNameLabel = _generateRandomId(`${yourAlias}domainname`, randomIds);
const osDiskName = _generateRandomId(`${yourAlias}osdisk`, randomIds);


export default createResources;