#!/bin/sh

#PATH="./"

PORT="9886"

echo "server listening on port $PORT"
./bmeg_server.py $PORT
