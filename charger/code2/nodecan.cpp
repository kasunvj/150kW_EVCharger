 #include "nodecan.hpp"

#define SIZE 5

using namespace std; 
using namespace rapidjson; 

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

void Decoder :: readPortData(){
     cout << "Loading NodeCAN protocol from Encoder : " << doc["version"].GetString() << endl;
}

void Encoder :: writePortData(){
    cout << "Loading NodeCAN protocol from Encoder : " << doc["version"].GetString() << endl;
}

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

int processCANMessages(scpp::SocketCan& can){
    if(can.open("can0") == scpp::STATUS_OK){
        cout << "CAN - ok" << endl;
    }else{
        cout << "CAN - fail" << endl;
        return 1;
    }

    Decoder decoder;

    scpp::CanFrame fr;
    while(1){
        if(can.read(fr) == scpp::STATUS_OK){
            printf("len %d byte, id: %x, data: %02x %02x %02x %02x %02x %02x %02x %02x  \n", fr.len, fr.id, 
                    fr.data[0], fr.data[1], fr.data[2], fr.data[3],
                    fr.data[4], fr.data[5], fr.data[6], fr.data[7]);
        }

        
        decoder.readPortData();
    }
};
