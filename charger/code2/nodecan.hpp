#ifndef NODECAN_HPP
#define NODECAN_HPP

#include "rapidjson/document.h"
#include "socketcan_cpp/socketcan_cpp/socketcan_cpp.h"
#include "rapidjson/filereadstream.h"
#include <iostream>
#include <memory>
#include <array>

#define PROTOCOL_FNAME "nodecan.json"
#define MAX_DEVICES_PER_POST 5

using namespace std;
using namespace rapidjson;

class Device {
public:
    int postId;
    int boardId;
    virtual void init() const = 0;
    virtual ~Device() = default;
};

class NetworkControllers : public Device {
public:
    void init() const override;
};

class PortControllers : public Device {
public:
    int voltage;
    void init() const override;
};

class Protocol {
public:
    Document doc;
    FILE* fp;
    char readBuffer[65536]; //2^16
    Protocol();
    void complete();
};

class Encoder : public Protocol{
public:
    void writePortData();
};

class Decoder : public Protocol {
public:
    void readPortData();
};

class Listener{};
class Writer {};

int loadConfig(Document& nodecan);
void initializeDevices();
int processCANMessages(scpp::SocketCan& can);
void sendCANMessages(string source,
                     int postid_s, 
                     int boardid_s, 
                     string dest,
                     int post_d,
                     int boardid_d,
                     string type,
                     string error,
                     string command,
                     string data);

#endif // NODECAN_HPP
