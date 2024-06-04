Example of implementing MongoDB Client Side Field Level Encryption (CSFLE). 

# Getting Started

# Clone this repo locally

git clone ... you know what to do

## Install mongosh with CSFLE dependencies

Download mongosh from https://www.mongodb.com/try/download/shell and install it. If you installed it a different way (e.g. homebrew on Mac), uninstall that first, 

## Create a cluster and connect to it

Create a cluster in MongoDB Atlas. Make sure you have access to it over the network (IP Access List), and that you have a user that can authenticate that has full authorization (Atlas Admin). 

## Set up the connectivity script

Create secrets/mongoURI.js with this content:

```js
mongoURI = "mongodb+srv://<etc.. the rest of your mongosh connection string with credentials>
```

## Connect to your cluster

Using the connection string from the previous step, open a terminal window and connect to your cluster with mongosh.

# Setting up CSFLE

Open another terminal window. From the root directory of this repo, run `mongosh --nodb local-keyfile/setup.js`. 

This creates the file `secrets/localKey.js`, which holds the "master key". It also creates the `encryption.__dataKeys` collection on the cluster, which holds the Data Encryption Keys (DEKs). It also erases the `test` database. 

Running setup.js again erases everything and creates a new local master key and DEK collection. 

# Writing encrypted data and reading it back

