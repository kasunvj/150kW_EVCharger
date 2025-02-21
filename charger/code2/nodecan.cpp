#include "nodecan.hpp"

#define SIZE 5

using namespace std; 
using namespace rapidjson; 

scpp::SocketCan can;
Encoder encoder;
Decoder decoder;
mutex cout_mutex;
ReceiveRawMsg receiveRawMsg;
TransmitRawMsg transmitRawMsg;


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
}id;

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
}commandType;

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

    
}errorType;

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
}nodeType;

struct Command{
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
            default:
                return "Not defined"; break;
        }  
    }
}command;

class TxBuffer{
    private:
        Message buffer[SIZE]; 
        int head,tail;
        int size;
        bool isFull;
    
    public:
        TxBuffer() : head(0), tail(0), isFull(false) {}
    
    bool isEmpty(){
        return (!isFull && (head==tail) );

        }

    bool isFullBuffer() const {
        return isFull;
        }

    void push(const Message& msg){
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

    bool pop(Message& msg) {
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
            buffer[i].display();
            i = (i + 1) % size;
        }
        std::cout << std::endl;
    }


};
TxBuffer cb;

void NetworkControllers :: init() const {
    cout << "Network Controller Speaking"<< endl;
};
    
void PortControllers :: init() const {
    cout << "Port Controller Speaking"<< endl;
};

Protocol :: Protocol(){
        fp = fopen(PROTOCOL_FNAME, "r");
        FileReadStream is(fp, readBuffer, sizeof(readBuffer));
        doc.ParseStream(is);
        complete();
};

void Decoder :: readProtocolData(ReceiveRawMsg msgreadinstance){
     cout << "Loading NodeCAN protocol from Encoder : " << doc["version"].GetString() << endl;
     printf("Decoder : id: %x \n",msgreadinstance.getId());

};

int Encoder :: writeProtocolData(Message& msg){
    cout << "Encoding using NodeCAN " << doc["version"].GetString() << endl;

    cout << nodeType.getName(nodeType.getNumb(msg.dest)) <<endl;
    cout << nodeType.getName(nodeType.getNumb(msg.source)) <<endl;
    cout << command.getName(command.getNumb(msg.devcommand)) <<endl;
    cout << errorType.getName(errorType.getNumb(msg.error)) <<endl;
    cout << commandType.getName(commandType.getNumb(msg.type)) <<endl;

    id.bits.desBoard = msg.boardid_d;
    id.bits.desPost = msg.postid_d;
    id.bits.desType = nodeType.getNumb(msg.dest);
    id.bits.srcBoard = msg.boardid_s;
    id.bits.srcPost = msg.postid_s;
    id.bits.srcType = nodeType.getNumb(msg.source);
    id.bits.cmd = command.getNumb(msg.devcommand);
    id.bits.err = errorType.getNumb(msg.error);
    id.bits.cmdType = commandType.getNumb(msg.type);
    id.bits.unalloc = 0;

    cout << "---------------" <<endl;

    printf("%d %x\n",id.canId,id.canId);

    cout << "---------------" <<endl;

    return 0;
};


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

void processCANMessages(){
    if(can.open("can0") == scpp::STATUS_OK){
        cout << "CAN - ok" << endl;
    }else{
        cout << "CAN - fail" << endl;
    }

    
    scpp::CanFrame fr;
    
    while(1){
        std::this_thread::sleep_for(std::chrono::milliseconds(200));
        std::lock_guard<std::mutex> lock(cout_mutex);
        if(can.read(fr) == scpp::STATUS_OK){
            printf("len %d byte, id: %x, data: %02x %02x %02x %02x %02x %02x %02x %02x  \n", fr.len, fr.id, 
                    fr.data[0], fr.data[1], fr.data[2], fr.data[3],
                    fr.data[4], fr.data[5], fr.data[6], fr.data[7]);
            
            receiveRawMsg.set(fr);
            decoder.readProtocolData(receiveRawMsg);
            printf("Reading id %x data from instance \n",receiveRawMsg.getId());
            
        }

        
        //decoder.readProtocolData();
    }
};

//void sendCANMessages(string source,int postid_s,int boardid_s, string dest,int post_d,int boardid_d,string type,string error,string command,string data){
void sendCANMessages(){
    while(1){
        std::this_thread::sleep_for(std::chrono::milliseconds(5000));
        std::lock_guard<std::mutex> lock(cout_mutex);
        cout << "Sending data: " << endl;
        if(!cb.isEmpty()){
            cout << "sending ++++++++++++++++++++++" << endl;
            cout << "head: "<< cb.getHead() << "    tail: "<<cb.getTail()<<endl;
            Message sendme;
            cb.pop(sendme);
            int id = encoder.writeProtocolData(sendme);
            sendme.display();
            cout << "sending ++++++++++++++++++++++" << endl;
        }
        
    }
};



void ReceiveRawMsg :: set(scpp::CanFrame frame){
    id = frame.id;
    for(int i= 0; i< sizeof(data)/sizeof(data[0]); i++){
        data[i] = frame.data[i];
    }
};

unsigned int ReceiveRawMsg :: getId(){
    return id;
};

unsigned int* ReceiveRawMsg :: getData(){
    return data;
};


void TransmitRawMsg :: set(){
    cout << "ID set to inside instance " << id << endl;
};


void Message :: setMessage(string source,
                            int postid_s, 
                            int boardid_s, 
                            string dest,
                            int postid_d,
                            int boardid_d,
                            string type,
                            string error,
                            string devcommand,
                            string data){
    source = source;
    postid_s = postid_s;
    boardid_s = boardid_s;
    dest = dest;
    postid_d = postid_d;
    boardid_d = boardid_d;
    type = type;
    error = error;
    devcommand = devcommand;
    data = data;
};


void send(Message& msg){
    cb.push(msg);
    cb.display();
};



