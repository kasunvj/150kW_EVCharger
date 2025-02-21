// Issue : public attributes on emssage

#ifndef NODECAN_HPP
#define NODECAN_HPP

#include "rapidjson/document.h"
#include "socketcan_cpp/socketcan_cpp/socketcan_cpp.h"
#include "rapidjson/filereadstream.h"
#include <iostream>
#include <memory>
#include <array>
#include <thread>
#include <chrono>
#include <mutex>

#define PROTOCOL_FNAME "nodecan.json"
#define MAX_DEVICES_PER_POST 5

using namespace std;
using namespace rapidjson;

class Message{
public:
    string source;
    int postid_s; 
    int boardid_s; 
    string dest;
    int postid_d;
    int boardid_d;
    string type;
    string error;
    string devcommand;
    string data; 

public:
    Message(string src = "", int pid_s = 0, int bid_s = 0,
            string dst = "", int pid_d = 0, int bid_d = 0,
            string typ = "", string err = "", string cmd = "", string dat = "")
        : source(src), postid_s(pid_s), boardid_s(bid_s),
          dest(dst), postid_d(pid_d), boardid_d(bid_d),
          type(typ), error(err), devcommand(cmd), data(dat) {}
    
    void display() const {
        cout << "Message from " << source << " to " << dest
             << " | Type: " << type << " | Command: " << devcommand
             << " | Data: " << data << endl;
    }

    void setMessage(string source,
                            int postid_s, 
                            int boardid_s, 
                            string dest,
                            int postid_d,
                            int boardid_d,
                            string type,
                            string error,
                            string command,
                            string data);


};

class ReceiveRawMsg {
private: 
    unsigned int id;
    unsigned int data[8];
public:
    void set(scpp::CanFrame frame);
    unsigned int getId();
    unsigned int* getData();
};


class TransmitRawMsg {
private: 
    int id;
    int data[8];
public:
    void set();
};


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
private:
    string source;
    int postid_s; 
    int boardid_s; 
    string dest;
    int post_d;
    int boardid_d;
    string type;
    string error;
    string command;
    string data;
public:
    int writeProtocolData(Message& msg);
};

class Decoder : public Protocol {
public:
    void readProtocolData(ReceiveRawMsg msgreadinstance);
};

class Listener{};
class Writer {};

int loadConfig(Document& nodecan);
void initializeDevices();
void processCANMessages();
void sendCANMessages();
void send(Message& msg);
/*
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
*/


#endif // NODECAN_HPP
