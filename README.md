# FLE-Demo
Demo for running CSFLE using Atlas as part of a workshop session

Steps for running this lab:

1. Login to your strigo environment and install git with the below commands: 

#Perform a quick update on your instance:
`sudo yum update -y`
 
#Install git in your EC2 instance
`sudo yum install git -y
`
2. On the Strigo environment ensure that node has been installed and set to the correct version with the below commands:

`curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash`

`. ~/.nvm/nvm.sh`

`nvm install 16`


3. Pull the source code for this repo and verify that the files are present 


4. Edit your .env file to add in your Atlas URI with the below command: 

`sudo vi .env`

Press "i" on your keyboard to enter edit mode 

Modify your Atlas URI field 

Press ':' and type 'x' to exit and save the VIM editor 

5. Run the encrypt.js file with the following command:

`node encrypt.js`

6. Observe the output in the console to verify that the documents were successfully inserted

7. Login to your cluster using compass and observe that the encrypted fields are present

