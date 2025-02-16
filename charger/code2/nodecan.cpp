#include "rapidjson/document.h" 
#include "rapidjson/filereadstream.h" 
#include <iostream>
#include <vector>
#include <memory>

using namespace std; 
using namespace rapidjson; 

#define PROTOCOL_FNAME "nodecan.json"
#define MAX_DEVICES_PER_POST 5


class Device{
    public:
        int postId;
        int boardId;
        virtual void init() const = 0;
};

class NetworkControllers : public Device{
    public:
        void init() const override{
            cout << "Network Controller Speaking"<< endl;
        }
    
};

class PortControllers : public Device{
    public:
        int voltage;
        void init() const override{
            cout << "Port Controller Speaking"<< endl;
        }

};

class Encoder{};

class Decoder{};



int main(){
    FILE* fp = fopen(PROTOCOL_FNAME, "r");
    char readBuffer[65536]; //2^16
    FileReadStream is(fp, readBuffer, sizeof(readBuffer));
    Document nodecan;
    nodecan.ParseStream(is);

    cout << nodecan["version"].GetString() << endl;

    vector<unique_ptr<Device>> devices;

    devices.push_back(make_unique<NetworkControllers>());
    devices.push_back(make_unique<PortControllers>());

    for(const auto& dev : devices){
        dev->init();
    }


    fclose(fp);

    return 0;
}