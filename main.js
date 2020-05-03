const fs = require('fs');

const gunzip = require('gunzip-file')

const logDirectory = `${process.env.APPDATA}/.minecraft/logs/`;

function extractChat(fileDirectory, fileName, outputDirectory, callback, options = { tempDirectory: "temp" }) {
    const outputFileName = fileName.replaceAll(".gz");
    const tempLog = options.tempDirectory + "/" + outputFileName;

    gunzip(fileDirectory + "/" + fileName, tempLog, () => {
        //Read the log
        fs.readFile(tempLog, 'binary', (err, content) => {
            if (!content) return;

            const chat = extractChatLines(content);
            if (!chat) return;

            fs.writeFile(outputDirectory + outputFileName, chat, () => {
                console.log("Succesfully saved chat log '%s' to", fileName, outputDirectory + outputFileName);

                if (callback) callback(chat);
            });
        });
    });
}

function extractAllChat(logDirectory, outputDirectory, callback) {

    // Create the output and temp folders if they dont exist
    if (!fs.existsSync("./temp")) fs.mkdirSync("./temp"); 
    if (!fs.existsSync(outputDirectory)) fs.mkdirSync(outputDirectory);

    let filesDone = 0;

    getAllFiles(logDirectory, files => {
        files.forEach(file => {
            if (file.includes(".gz")) {
                extractChat(logDirectory, file, outputDirectory + "/", () => {
                    filesDone += 1;

                    if (filesDone == files.length - 1) callback();
                });
            }
        });
    });
}

function extractChatLines(string) {
    const lines = string.split("\n");
    const chatLines = new Set;

    lines.forEach(line => {
        if (line.includes("[CHAT]")) chatLines.add(line);
    });

    if (![...chatLines].join("")) return;

    return [...chatLines].join("\n");
}

function getAllFiles(directory, callback) {
    fs.readdir(directory, (err, files) => {
        if (err) return console.log(err);

        if (callback) callback(files);
    })
}

String.prototype.replaceAll = function (str1, str2 = "") {
    return this.split(str1).join(str2);
}

extractAllChat(logDirectory, "output", () => {
    console.log("Completed");
});