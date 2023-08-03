var axios = require("axios");
class GmailAPI {
    accessToken = ""
    constructor() {
        this.accessToken = this.getAcceToken();
    }

    getAcceToken = async () => {
        const apiUrl = 'https://accounts.google.com/o/oauth2/token';
        const requestData = {
            refresh_token: process.env.REFRESH_TOKEN,
            client_id: process.env.CLIENT_ID,
            client_secret: process.env.CLIENT_SECRET,
            grant_type: process.env.GRANT_TYPE
        };

        axios.post(apiUrl, new URLSearchParams(requestData))
            .then(response => {
                const { access_token } = response.data;
                this.accessToken = access_token
            })
            .catch(error => {
                console.error('Error:', error.message);
            });

    };

    searchGmail = async (searchItem) => {
        var threadId = "";
        var config1 = {
            method: "get",
            url:
                "https://www.googleapis.com/gmail/v1/users/me/messages?q=" + searchItem,
            headers: {
                Authorization: `Bearer ${await this.accessToken} `,
            },
        };

        await axios(config1)
            .then(async function (response) {
                threadId = await response.data["messages"][0].id;
            })
            .catch(function (error) {
                // console.log(error);
            });

        return threadId;
    };

    getCreatedDate = async (threadId) => {
        let createdDate = null;
        await axios.get(`https://www.googleapis.com/gmail/v1/users/me/threads/${threadId}`, {
            headers: {
                Authorization: `Bearer ${this.accessToken}`
            }
        })
            .then(response => {
                const thread = response.data;
                const { messages } = thread;
                createdDate = new Date(parseInt(messages[0].internalDate));
            })
            .catch(error => {
                console.error('Error:', error);
            });

        return createdDate
    }

    readGmailContent = async (messageId) => {
        var data = {};
        var config = {
            method: "get",
            url: `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}`,
            headers: {
                Authorization: `Bearer ${await this.accessToken}`,
            },
        };

        await axios(config)
            .then(async function (response) {
                data = await response.data;
            })
            .catch(function (error) {
                // console.log(error);
            });

        return data;
    };

    readInboxContent = async (searchText) => {
        let decodedStr = "No such Email found";
        let createdDate = null;
        try {
            const threadId = await this.searchGmail(searchText);
            const message = await this.readGmailContent(threadId);
            createdDate = await this.getCreatedDate(threadId);
            const encodedMessage = await message.payload["parts"][0].body.data;
            decodedStr = atob(encodedMessage);
        } catch (error) {
            // console.log(error);
        }
        finally {
            return {
                message: decodedStr,
                createdDate
            };
        }
    };
}

module.exports = new GmailAPI();