#!/bin/sh

. config/server.sh

# if server not running, quit
if ! [ -f $PID_FILE ]
then
	echo "Server already stopped."
	exit
fi

# read pid from file
pid=`cat $PID_FILE`

# kill the server process
kill $pid
echo "Killed server process with pid $pid."

# delete the pid file
rm $PID_FILE
echo "Deleted pid file $PID_FILE"

echo