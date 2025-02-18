#include "socketcan_cpp/socketcan_cpp/socketcan_cpp.h"
#include <string>
#include <iostream>
using namespace std ;
int main(){
    scpp::SocketCan can;
    if(can.open("can0") == scpp::STATUS_OK){
        cout << "CAN - ok" << endl;
    }else{
        cout << "CAN - fail" << endl;
        return 1;
    }

    scpp::CanFrame fr;
    while(1){
        if(can.read(fr) == scpp::STATUS_OK){
            printf("len %d byte, id: %d, data: %02x %02x %02x %02x %02x %02x %02x %02x  \n", fr.len, fr.id, 
                    fr.data[0], fr.data[1], fr.data[2], fr.data[3],
                    fr.data[4], fr.data[5], fr.data[6], fr.data[7]);
        }
    }


    return 0;
}


//g++ main.cpp -o main -I /usr/local/include -lsocketcan_cpp
//can0  08052060   [8]  00 00 00 00 00 00 00 00