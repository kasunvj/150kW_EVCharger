 #include "nodecan.hpp"

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

void Encoder :: readprotdata(){
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


void initializeDevices(vector<unique_ptr<Device>>& devices){
    devices.push_back(make_unique<NetworkControllers>());
    devices.push_back(make_unique<PortControllers>());
    for(const auto& dev : devices){
        dev->init();
    }
};

int processCANMessages(scpp::SocketCan& can){
    if(can.open("can0") == scpp::STATUS_OK){
        cout << "CAN - ok" << endl;
    }else{
        cout << "CAN - fail" << endl;
        return 1;
    }

    Encoder encoder;

    scpp::CanFrame fr;
    while(1){
        if(can.read(fr) == scpp::STATUS_OK){
            printf("len %d byte, id: %x, data: %02x %02x %02x %02x %02x %02x %02x %02x  \n", fr.len, fr.id, 
                    fr.data[0], fr.data[1], fr.data[2], fr.data[3],
                    fr.data[4], fr.data[5], fr.data[6], fr.data[7]);
        }

        
        //encoder.readprotdata();
    }
};
