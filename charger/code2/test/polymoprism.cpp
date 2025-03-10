#include<iostream>
using namespace std;

class Device {
public:
    int currentPCs = 0;
    virtual void init() const = 0;
    virtual ~Device() = default;
    
};

class PortControllers : public Device {
private:
    int postId = 0;
    int boardId = 0;
    int portId = 0;
public:
    void init() const override;
    void setpostId(int x){postId = x;}
    void setboardId(int x){boardId = x;}
    void setportId(int x){portId = x;}
    int getpostId(){return postId;}
    int getboardId(){return boardId;}
    int getportId(){return portId;}

};

class NetworkControllers : public Device {
public:
    void init() const override;
};

void PortControllers :: init() const {
    cout << "Port Controller Checking.."<< endl;
};

void NetworkControllers :: init() const {
    cout << "Network Controller Checking.."<< endl;
};  

int main(){

    Device* devices;



    PortControllers pc;
    devices = &pc;
    devices -> init();

    NetworkControllers nc;
    devices = &nc;
    devices -> init();


    return 0;
}