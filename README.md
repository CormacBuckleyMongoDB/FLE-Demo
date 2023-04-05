# FLE-Demo
Demo for running CSFLE using Atlas as part of a workshop session

Steps for running this lab:

**1. Login to your strigo environment and install git with the below commands:** <br />

Perform a quick update on your instance:<br />
`sudo yum update -y` <br />
 
#Install git in your EC2 instance <br />
`sudo yum install git -y  <br />
`
**2. On the Strigo environment ensure that node has been installed and set to the correct version with the below commands:** <br />

`curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash` <br />

`. ~/.nvm/nvm.sh` <br />

`nvm install 16` <br />


**3. Pull the source code for this repo and verify that the files are present** <br />


**4. Edit your .env file to add in your Atlas URI with the below command:** <br />

`sudo vi .env` <br />

Press "i" on your keyboard to enter edit mode <br />

Modify your Atlas URI field <br />

Press ':' and type 'x' to exit and save the VIM editor <br />

**5. Run the encrypt.js file with the following command:** <br />

`node encrypt.js` <br />

**6. Observe the output in the console to verify that the documents were successfully inserted** <br />

**7. Login to your cluster using compass and observe that the encrypted fields are present** <br />

