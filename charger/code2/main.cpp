#include<iostream>
#include "nodecan.hpp"
#include "socketcan_cpp/socketcan_cpp/socketcan_cpp.h"
#include <vector>
#include <memory>

int main(){
    Protocol prot; 

    vector<unique_ptr<Device>> devices;
    initializeDevices(devices);

    scpp::SocketCan can;
    processCANMessages(can);


    return 0;
}