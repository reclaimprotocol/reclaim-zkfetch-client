#! /bin/bash

node node_modules/@reclaimprotocol/zk-symmetric-crypto/lib/scripts/download-files
mkdir -p public/browser-rpc
cp -r ./node_modules/@reclaimprotocol/zk-symmetric-crypto/resources ./public/browser-rpc