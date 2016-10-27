/**
 * appBeforeBuild2MakePRD.js
 * @author LuoWen
 * @date 20160505
 */
module.exports = function(context) {
    var path = context.requireCordovaModule('path'),
        fs = context.requireCordovaModule('fs'),
        shell = context.requireCordovaModule('shelljs'),
        projectRoot = context.opts.projectRoot;

    //--------------------Android-------------------
    if (context.opts.cordova.platforms.indexOf("android") !== -1) {
        var targetDir = path.join(projectRoot, "platforms", "android", "src", "org", "apache", "cordova", "filetransfer");
        var targetFiles = ["FileTransfer.java"];
        var tmpls = [{
            source: "outputStream = resourceApi.openOutputStream(targetUri);",
            target: "outputStream = resourceApi.openOutputStream(targetUri, true /*Commented for PRD by LuoWen*/);"
        }, {
            source: "file.delete();",
            target: "//file.delete(/*Commented for PRD by LuoWen*/);"
        }, {
            source: "file.delete();",
            target: "//file.delete(/*Commented for PRD by LuoWen*/);"
        }];

        replaceTmpls(fs, path, targetDir, targetFiles, tmpls);

        //--------------------iOS-------------------
    } else if (context.opts.cordova.platforms.indexOf("ios") !== -1) {
        var targetDir = path.join(projectRoot, "platforms", "ios", "小爱学习圈", "plugins", "cordova-plugin-file-transfer");
        var targetFiles = ["CDVFileTransfer.m"];
        var tmpls = [{
            source: "// create target file",
            target: "if ([[NSFileManager defaultManager] fileExistsAtPath:filePath] == NO) { \r\n // /*Commented for PRD by LuoWen*/create target file"
        }, {
            source: "// open target file for writing",
            target: "} \r\n // /*Commented for PRD by LuoWen*/open target file for writing"
        }, {
            source: 'DLog(@"Streaming to file %@", filePath);',
            target: '[self.targetFileHandle seekToEndOfFile]; \r\n DLog(@"Streaming to file %@", filePath/*Commented for PRD by LuoWen*/);'
        }];

        replaceTmpls(fs, path, targetDir, targetFiles, tmpls);

        //--------------------Others-------------------
    } else {
        console.log('Unknown Platform', context.opts.cordova.platforms);
    }
};

function replaceTmpls(fs, path, targetDir, targetFiles, tmpls) {
    targetFiles.forEach(function(file) {
        var targetFile = path.join(targetDir, file);
        fs.readFile(targetFile, {
            encoding: 'utf-8'
        }, function(err, data) {
            if (err) {
                throw err;
            }
            var originData = data;

            tmpls.forEach(function(tmpl) {
                data = data.replace(tmpl.source, tmpl.target);
            });
            
            if (data.split(/Commented/mg).length === tmpls.length + 1) {
                if (originData === data) {
                    console.log("\r\nPRD running, no need to replace.\r\n");
                } else {
                    console.log('\r\nPRD replace success.\r\n');
                }
            } else {
                console.error("\r\nPRD replace Failed !!!\r\n");
            }

            fs.writeFileSync(targetFile, data);
        });
    });
}
