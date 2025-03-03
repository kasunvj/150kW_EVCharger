#include<iostream>
#include "nodecan.hpp"
#include "socketcan_cpp/socketcan_cpp.h"
#include <unistd.h>
using namespace std;


int main(){
    //reading the protocol
    cout << "starting"<< endl;
    //Protocol prot; 

    //walkin
    initializeDevices();
    
    //processing incomming messges
    
    thread receiver(processCANMessages);
    thread sender(sendCANMessages);
    

    cout << "sending msgs...................."<< endl;
    //sending messges
    
    Message msg1("nc",0,0,"brd",0,0,"request","normal","net_walkin","");
    Message msg2("nc",0,0,"pc",0,0,"request","normal","net_sync","");//00 0a 40 00

    send(msg1);
    while(1){
        usleep(1000000);
        send(msg2);
    }
   
    
    
    cout << "sending msgs...................."<< endl;

    receiver.join();
    sender.join();
    
    return 0;
}