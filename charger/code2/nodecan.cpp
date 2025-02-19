 #include "nodecan.hpp"

#define SIZE 5

using namespace std; 
using namespace rapidjson; 

scpp::SocketCan can;

void NetworkControllers :: init() const {
    cout << "Network Controller Speaking"<< endl;
};
    
void PortControllers :: init() const {
    cout << "Port Controller Speaking"<< endl;
}


Protocol :: Protocol(){
        fp = fopen(PROTOCOL_FNAME, "r");
        FileReadStream is(fp, readBuffer, sizeof(readBuffer));
        doc.ParseStream(is);
        complete();
};

void Decoder :: readProtocolData(){
     cout << "Loading NodeCAN protocol from Encoder : " << doc["version"].GetString() << endl;
}

void Encoder :: writeProtocolData(){
    cout << "Loading NodeCAN protocol from Encoder : " << doc["version"].GetString() << endl;

}
Encoder encoder;

void Protocol :: complete(){
    if (doc.HasParseError()) {
        cerr << "Error: Failed to parse " << PROTOCOL_FNAME << endl;
        return;
    }
    cout << "Loading NodeCAN protocol : " << doc["version"].GetString() << endl;
    fclose(fp);
};


void initializeDevices(){
    array<std::unique_ptr<Device>, SIZE> devices;
    int count = 0;

    devices[0] = make_unique<NetworkControllers>();
    devices[1] = make_unique<PortControllers>();
    
    for (int i=0; i< 2 ; i++ ) {
        devices[i]->init();
    }
};

int processCANMessages(){
    if(can.open("can0") == scpp::STATUS_OK){
        cout << "CAN - ok" << endl;
    }else{
        cout << "CAN - fail" << endl;
        return 1;
    }

    Decoder decoder;
    scpp::CanFrame fr;
    
    while(1){
        std::lock_guard<std::mutex> lock(cout_mutex);
        if(can.read(fr) == scpp::STATUS_OK){
            printf("len %d byte, id: %x, data: %02x %02x %02x %02x %02x %02x %02x %02x  \n", fr.len, fr.id, 
                    fr.data[0], fr.data[1], fr.data[2], fr.data[3],
                    fr.data[4], fr.data[5], fr.data[6], fr.data[7]);
        }

        
        //decoder.readProtocolData();
    }
};

void sendCANMessages(string source,int postid_s,int boardid_s, string dest,int post_d,int boardid_d,string type,string error,string command,string data){
    
    }

void sendCANMessagesDummy(){
    while(1){
        this_thread::sleep_for(std::chrono::seconds(1));
        lock_guard<std::mutex> lock(cout_mutex);
        std::cout << "Sending data: " << count++ << std::endl;
    }
    

}
