#include<iostream>
#include "nodecan.hpp"
#include "socketcan_cpp/socketcan_cpp/socketcan_cpp.h"

int main(){
    //reading the protocol
    Protocol prot; 

    //walkin
    initializeDevices();

    //processing incomming messges
    scpp::SocketCan can;
    processCANMessages(can);

    //sending messges
    sendCANMessages("NC",0,0,"BR",0,0,"REQ","NOR","NET_SYNC","");


    return 0;
}