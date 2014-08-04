#!/bin/sh

#PATH="./"

PORT="9886"

echo "server listening on port $PORT"
python ./bmeg_server.py $PORT
