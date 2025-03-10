// Issue : public attributes on emssage

#ifndef NODECAN_HPP
#define NODECAN_HPP

#include "socketcan_cpp/socketcan_cpp.h"
#include "include/json.hpp"
#include <fstream>
#include <iostream>
#include <memory>
#include <array>
#include <thread>
#include <chrono>
#include <mutex>
#include <cstring>


#define PROTOCOL_FNAME "nodecan.json"
#define MAX_SUCH_DEVICES 10
#define TXRX_BUFFER_SIZE 5
#define JSON_OUTPUT_FNAME "device_list.json"

using namespace std;
using json = nlohmann::json;

union ID{
    struct{
       unsigned int desBoard : 3 ;
       unsigned int desPost :  2 ;
       unsigned int desType :  3 ;
       unsigned int srcBoard : 3 ;
       unsigned int srcPost :  2 ;
       unsigned int srcType :  3 ;
       unsigned int cmd :      8 ;
       unsigned int err :      3 ;
       unsigned int cmdType :  2 ;
       unsigned int unalloc :  3 ;
    } bits;
    uint32_t canId;
};

union Data{
    uint8_t bytes[8];
    uint64_t canData;
};

struct CommandType{
    unsigned int reqest =   0;
    unsigned int responce = 1;
    unsigned int getNumb(string type){
        if(type.compare("request") == 0)
            return reqest;
        else if(type.compare("responce") == 0) 
            return responce;
        else
            return 0;
    }
    string getName(int type){
        switch(type){
            case 0:
                return "request";break;
            case 1:
                return "responce";break;
            default:
                return "Not defined"; break;
        }  
    }
};

struct ErrorType{ 
    unsigned int normal =    0;
    unsigned int fault =     1;
    unsigned int busy =      2;
    unsigned int invalcmd =  3;
    unsigned int invaldata = 4;
    unsigned int getNumb(string type){
        if(type.compare("normal") == 0)
            return normal;
        else if(type.compare("fault") == 0) 
            return fault;
        else if(type.compare("busy") == 0) 
            return busy;
        else if(type.compare("invalcmd") == 0) 
            return invalcmd;
        else if(type.compare("invaldata") == 0) 
            return invaldata;
        else
            return 0;
    };
    string getName(int type){
        switch(type){
            case 0:
                return "normal";break;
            case 1:
                return "fault";break;
            case 2:
                return "busy";break;
            case 3:
                return "responce";break;
            case 4:
                return "invaldata";break;
            default:
                return "Not defined"; break;
        }  
    }

    
};

struct NodeType{
    unsigned int pc =  0;
    unsigned int cc =  1;
    unsigned int nc =  2;
    unsigned int tmc = 3;
    unsigned int esc = 4;
    unsigned int brd = 5;
    unsigned int getNumb(string type){
        if(type.compare("pc") == 0)
            return pc;
        else if(type.compare("cc") == 0) 
            return cc;
        else if(type.compare("nc") == 0) 
            return nc;
        else if(type.compare("tmc") == 0) 
            return tmc;
        else if(type.compare("esc") == 0) 
            return esc;
        else if(type.compare("brd") == 0) 
            return brd;
        else
            return 0;
    }
    string getName(int type){
        switch(type){
            case 0:
                return "pc";break;
            case 1:
                return "cc";break;
            case 2:
                return "nc";break;
            case 3:
                return "tmc";break;
            case 4:
                return "esc";break;
            case 5:
                return "brd";break;
            default:
                return "Not defined"; break;
        }  
    }
};

struct CommandName{
    unsigned int set_ota =            0;
    unsigned int set_config =         1;
    unsigned int set_voltagecurent =  2;
    unsigned int get_maxvoltage =     3;
    unsigned int set_portauth =       4;
    unsigned int get_portmesurement = 5;
    unsigned int set_tmctemp =        6;
    unsigned int set_escstate =       7;
    unsigned int set_maxpower =       8;
    unsigned int set_logdata =        9;
    unsigned int net_sync =          10;
    unsigned int net_walkin =        11;

    unsigned int getNumb(string type){
        if(type.compare("set_ota") == 0)
            return set_ota;
        else if(type.compare("set_config") == 0) 
            return set_config;
        else if(type.compare("set_voltagecurent") == 0) 
            return set_voltagecurent;
        else if(type.compare("get_maxvoltage") == 0) 
            return get_maxvoltage;
        else if(type.compare("set_portauth") == 0) 
            return set_portauth;
        else if(type.compare("get_portmesurement") == 0) 
            return get_portmesurement;
        else if(type.compare("set_tmctemp") == 0) 
            return set_tmctemp;
        else if(type.compare("set_escstate") == 0) 
            return set_escstate ;
        else if(type.compare("set_maxpower") == 0) 
            return set_maxpower;
        else if(type.compare("set_logdata") == 0) 
            return set_logdata;
        else if(type.compare("net_sync") == 0) 
            return net_sync;
        else if(type.compare("net_walkin") == 0) 
            return net_walkin;
        else
            return 9;
    };
    string getName(int type){
        switch(type){
            case 0:
                return "set_ota";break;
            case 1:
                return "set_config";break;
            case 2:
                return "set_voltagecurent";break;
            case 3:
                return "get_maxvoltage";break;
            case 4:
                return "set_portauth";break;
            case 5:
                return "get_portmesurement";break;
            case 6:
                return "set_tmctemp";break;
            case 7:
                return "set_escstate";break;
            case 8:
                return "set_maxpower";break;
            case 9:
                return "set_logdata";break;
            case 10:
                return "net_sync";break;
            case 11:
                return "net_walkin";break;
            default:
                return "Not defined"; break;
        }  
    }
};

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
    Data data;
public:
    void set(scpp::CanFrame frame);
    unsigned int getId();
    uint8_t* getData();
    uint64_t getData64();
};


class TransmitRawMsg {
private: 
    uint32_t id;
    uint8_t data[8];
public:
    void set(const ID& msgId, const Data& msgData) {
        id = msgId.canId;                  
        memcpy(data, msgData.bytes, 8);
    }
    uint32_t getId() const { return id; }
    const uint8_t* getData() const { return data; }
};


class Device {
public:
    unsigned int currentPCs = 0;
    unsigned int currentCCs = 0;
    unsigned int currentNCs = 0;
    unsigned int currentTMCs = 0;
    unsigned int currentESCs = 0;

    //virtual int init(){return 0;};
    //virtual ~Device() = default;
    unsigned int getCurrentPCs(){return currentPCs;}
    void setCurrentPCs(unsigned int c){currentPCs = c;}
    unsigned int getCurrentCCs(){return currentCCs;}
    void setCurrentCCs(unsigned int c){currentCCs = c;}
    unsigned int getCurrentNCs(){return currentNCs;}
    void setCurrentNCs(unsigned int c){currentNCs = c;}
    unsigned int getCurrentTMCs(){return currentTMCs;}
    void setCurrentTMCs(unsigned int c){currentTMCs = c;}
    unsigned int getCurrentESCs(){return currentESCs;}
    void setCurrentESCs(unsigned int c){currentESCs = c;}
    
};


class PortControllers {
private:
    unsigned int postId = 0;
    unsigned int boardId = 0;
    
public:
    PortControllers(unsigned int pid,unsigned int bid){//post id and board id
        postId =pid;
        boardId= bid;
    }
    int init();
    void setpostId(unsigned int x){postId = x;}
    void setboardId(unsigned int x){boardId = x;}
    int getpostId(){return postId;}
    int getboardId(){return boardId;}
    

};

class CabinetControllers  {
private:
    unsigned int postId = 0;
    unsigned int boardId = 0;
    
public:
    CabinetControllers(unsigned int pid,unsigned int bid){//post id and board id
        postId =pid;
        boardId= bid;
    }
    int init();
    void setpostId(unsigned int x){postId = x;}
    void setboardId(unsigned int x){boardId = x;}
    int getpostId(){return postId;}
    int getboardId(){return boardId;}
};

class NetworkControllers {
private:
    unsigned int postId = 0;
    unsigned int boardId = 0;   
public:
    NetworkControllers(unsigned int pid,unsigned int bid){//post id and board id
        postId =pid;
        boardId= bid;
    }
    int init();
    void setpostId(unsigned int x){postId = x;}
    void setboardId(unsigned int x){boardId = x;}
    int getpostId(){return postId;}
    int getboardId(){return boardId;}
};

class ThermalControllers {
private:
    unsigned int postId = 0;
    unsigned int boardId = 0;   
public:
    ThermalControllers(unsigned int pid,unsigned int bid){//post id and board id
        postId =pid;
        boardId= bid;
    }
    int init();
    void setpostId(unsigned int x){postId = x;}
    void setboardId(unsigned int x){boardId = x;}
    int getpostId(){return postId;}
    int getboardId(){return boardId;}
};

class EnvControllers {
private:
    unsigned int postId = 0;
    unsigned int boardId = 0;   
public:
    EnvControllers(unsigned int pid,unsigned int bid){//post id and board id
        postId =pid;
        boardId= bid;
    }
    int init();
    void setpostId(unsigned int x){postId = x;}
    void setboardId(unsigned int x){boardId = x;}
    int getpostId(){return postId;}
    int getboardId(){return boardId;}
};


class TxBuffer : public TransmitRawMsg {
    private:
        TransmitRawMsg buffer[TXRX_BUFFER_SIZE]; 
        int head,tail;
        int size = TXRX_BUFFER_SIZE;
        bool isFull;
    
    public:
        TxBuffer() : head(0), tail(0), isFull(false) {}
    
    bool isEmpty(){
        return (!isFull && (head==tail) );

        }

    bool isFullBuffer() const {
        return isFull;
        }

    void push(const TransmitRawMsg& msg){
        buffer[tail] = msg;
        tail = (tail + 1) % size;

        if(isFull){
            head = (head + 1) % size;
        }

        isFull = (head == tail);
    }

    int getHead(){
        return head;
    }

    int getTail(){
        return tail;
    }

    bool pop(TransmitRawMsg& msg) {
        if (isEmpty()) {
            std::cerr << "Buffer Underflow!" << std::endl;
            return false;
        }

        msg = buffer[head];
        head = (head + 1) % size;
        isFull = false;
        return true;
    }

    void display() {
        if (isEmpty()) {
            std::cout << "Buffer is empty." << std::endl;
            return;
        }
        
        std::cout << "Buffer: ";
        int i = head;
        while (i != tail) {
            //buffer[i].display();
            i = (i + 1) % size;
        }
        std::cout << std::endl;
    }


};

class RxBuffer : public ReceiveRawMsg {
    private:
        ReceiveRawMsg buffer[TXRX_BUFFER_SIZE]; 
        int head,tail;
        int size = TXRX_BUFFER_SIZE;
        bool isFull;
    
    public:
        RxBuffer() : head(0), tail(0), isFull(false) {}
    
    bool isEmpty(){
        return (!isFull && (head==tail) );

        }

    bool isFullBuffer() const {
        cout << "buffer full" << endl;
        return isFull;
        }

    void push(const ReceiveRawMsg& msg){
        buffer[tail] = msg;
        tail = (tail + 1) % size;

        if(isFull){
            head = (head + 1) % size;
        }

        isFull = (head == tail);
    }

    int getHead(){
        return head;
    }

    int getTail(){
        return tail;
    }

    bool pop(ReceiveRawMsg& msg) {
        if (isEmpty()) {
            std::cerr << "Buffer Underflow!" << std::endl;
            return false;
        }

        msg = buffer[head];
        head = (head + 1) % size;
        isFull = false;
        return true;
    }

    void display() {
        if (isEmpty()) {
            std::cout << "Buffer is empty." << std::endl;
            return;
        }
        
        std::cout << "Buffer: ";
        int i = head;
        while (i != tail) {
            //buffer[i].display();
            i = (i + 1) % size;
        }
        std::cout << std::endl;
    }


};


class Encoder {
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

class Decoder {
public:
    int readProtocolData(ReceiveRawMsg& msg);
};

class Listener{};
class Writer {};


//int loadConfig(Document& nodecan);
void initializeDevices();
int processCANMessages();
void sendCANMessages();
void send(Message& msg);
void emit();
void checkingDevices(int type, int postid, int boardid);
void SetColor(int textColor);
void ResetColor();
void jsonWrite(string key, int value);

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
