# Next.js web app to create throwables VM with Auth


The authentification is done with NextAuth.js

NextAuth.js is an open-source authentication library designed for Next.js-based web applications. It provides a straightforward solution for managing authentication, user login, and session handling. 

Its usage in the project simplifies security and ensures a seamless user experience.

All the fonctions that provides the VM creation/deletion has been made following the 
[Microsoft tutoriel "Use Azure SDKs to create a virtual machine"](https://learn.microsoft.com/en-us/azure/developer/javascript/how-to/with-azure-sdk/create-manage-virtual-machine)

## Getting Started

1. ### Install all dependencies:

```bash
pnpm i
```

2. ### Run the development server:

```bash
pnpm run dev
```

3. ### Create your .env file with the following variables:

```bash
NEXTAUTH_SECRET='yournextauthsecret'
NEXTAUTH_URL='http://localhost:3000/'

AZURE_TENANT_ID='yourtenantid'
AZURE_CLIENT_ID='yourclientid'
AZURE_CLIENT_SECRET='yourclientsecret'
AZURE_SUBSCRIPTION_ID='yoursubscriptionid'
```

to get the nextauth secret you can run the following command:
```bash
openssl rand -base64 32
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Usage

### Users

You can log with the following users:

```json
    {
      "name": "coucou",
      "password": "coucou",
      "access": "tout"
    },
    {
      "name": "salut",
        "password": "salut",
        "access": "un seul"
    },
    {
      "name": "bonjour",
      "password": "bonjour",
      "access": "aucun"
    }
```

## OS Selection
Then click on the OS that you want to create a VM.

When the VM is ready, the information will be displayed on top of the screen

The Virtual Machine and the Resource Group will be created in the Azure subscription that you have provided in the .env file

It will take a few minutes to create the VM.

Then it will take 15 minutes to delete the VM and the Resource Group

