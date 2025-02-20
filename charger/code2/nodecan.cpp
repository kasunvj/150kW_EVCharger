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

class CircularBuffer{
    private:
        Message buffer[SIZE]; 
        int head,tail;
        int size;
        bool isFull;
    
    public:
        CircularBuffer() : head(0), tail(0), isFull(false) {}
    
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
CircularBuffer cb;



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

void Encoder :: writeProtocolData(){
    cout << "Loading NodeCAN protocol from Encoder : " << doc["version"].GetString() << endl;

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
            sendme.display();
            cout << "sending ++++++++++++++++++++++" << endl;
        }
        encoder.writeProtocolData();
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
                            string command,
                            string data){
    source = source;
    postid_s = postid_s;
    boardid_s = boardid_s;
    dest = dest;
    postid_d = postid_d;
    boardid_d = boardid_d;
    type = type;
    error = error;
    command = command;
    data = data;
};


void send(Message& msg){
    cb.push(msg);
    cb.display();
};



