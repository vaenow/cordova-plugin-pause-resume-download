/**
 ***********************************工具方法***********************************
 */
/**
 * 执行一次
 * @param fn
 * @returns {Function}
 * @private
 */
function _once(fn) {
    return function () {
        if (fn === null) return;
        fn.apply(this, arguments);
        fn = null;
    };
}

/**
 * 绑定上下文
 * @param scope
 * @param fn
 * @returns {Function}
 * @private
 */
function _bind(scope, fn) {
    return function () {
        fn.apply(scope, arguments);
    };
}

/**
 * 断点续传 constructor
 * @param option
 * @constructor
 */




function PRD(option) {
    option = option || {};
    this.disk = option.disk || cordova.file.dataDirectory;
    this.repeatNum = option.repeatNum || 10;
    this.percent = 0.00;
    this.verbose = option.verbose || false;
    this.percentFilter = option.percentFilter || 0.01;
    this._tempper = 0;
}
/**
 * 下载文件 参考FileTransfer download 的使用
 * @param url
 * @param fileURl
 * @param successCallback
 * @param errorCallback
 * @param trustAllHosts
 * @param options
 */
PRD.prototype.download = function (url, fileURl, successCallback, errorCallback, trustAllHosts, options) {

    var _this = this;
    this.repeat = 0;
    this.fileURl = fileURl;
    this.successCallback = successCallback;
    this.errorCallback = errorCallback;
    this.trustAllHosts = trustAllHosts;
    this.options = options;
    _this.url = url;

    _this._getUrlFileLength(url, function (err, len) {
        if (err) {
            errorCallback && errorCallback(err);
        } else {
            _this.totalLen = len;
            _this._updateInfoAndDownload();
        }
    });


};
/**
 * 更新文件大小信息并下载
 * @private
 */
PRD.prototype._updateInfoAndDownload = function () {

    this.fileTransfer = new FileTransfer();
    this.fileTransfer.onprogress = _bind(this, this._onprogress);

    var _this = this;
    _this.getFileInfo(_this.fileURl, function (err, len,fileEntry) {
        if (err) {
            _this.start = 0;
        } else {
            _this.start = len;
            if(len >= _this.totalLen){
                _this.successCallback(fileEntry);
                return;
            }
        }
        console.log('repeat : ' + _this.repeat);
        console.log('start : ' + _this.start);
        _this._downloadFile(function (err, fileEntry) {
            if (err) {
                _this.repeat++;
                if (_this._isAbort || _this.repeat > _this.repeatNum) {
                    _this.errorCallback(err);
                } else {
                    setTimeout(_bind(_this, _this._updateInfoAndDownload), _this.repeat * 500);
                }
            } else {
                _this.getFileInfo(_this.fileURl,function(err,len){
                    console.log("download complete: ");
                    console.log("file : " + _this.fileURl);
                    console.log("download size : " + _this.totalLen);
                    console.log("file size : " + len);
                });
                _this.successCallback(fileEntry);
            }
        });
    });
};
/**
 * 获取文件信息，不存在err, 存在返回size
 */
PRD.prototype.getFileInfo = function(file, cb) {
    var _this = this;
    resolveLocalFileSystemURL(file, function (fileEntry) {
        fileEntry.file(function (file) {//获取文件大小信息
            if(file.size > _this.totalLen){
                fileEntry.remove(function(){
                    cb(null,0);
                },errorHandler);
            }else{
                cb(null, file.size,fileEntry);
            }
        }, function (err) {
            cb(err);
        });
    }, function (err) {
        cb(err);
    });


};
/**
 * 处理onpress 事件
 * @param progressEvent
 * @private
 */
PRD.prototype._onprogress = function (progressEvent) {
    progressEvent.loaded = this.start + progressEvent.loaded;
    progressEvent.total = this.totalLen;
    this.onprogress && this.onprogress(progressEvent);


    this.percent  = parseFloat((progressEvent.loaded /progressEvent.total).toFixed(3));

    if(this.verbose && (this.percent - this._tempper > this.percentFilter) ){
        this._tempper = this.percent;
       console.log(this.percent);
    }
};
/**
 * 获取url的文件大小
 * @param uri
 * @param cb
 * @private
 */
PRD.prototype._getUrlFileLength = function (uri, cb) {


    var fileTransfer = new FileTransfer();

    var temp = this.disk + '/temp.zip';
    var isCall = false;

    uri = encodeURI(uri);

    fileTransfer.download(
        uri,
        temp,
        function (entry) {
            console.log("download complete: " + entry.toURL());
        },
        function (err) {
            handleDone(err);
        },
        false,
        {}
    );
    fileTransfer.onprogress = _once(onprogress);
    function onprogress(progressEvent) {
        fileTransfer.abort();
        resolveLocalFileSystemURL(temp, function (fileEntry) {
            fileEntry.remove();
        });
        console.log('len: ' + progressEvent.total);
        handleDone(null, progressEvent.total);
    }

    function handleDone(err, len) {
        if (isCall) return;
        isCall = true;
        cb(err, len);
    }
};
/**
 * 下载文件
 * @private
 */
PRD.prototype._downloadFile = function (cb) {
    this.fileTransfer.download(this.url, this.fileURl,
        function (fileEntry) {
            cb(null, fileEntry);
        }, function (err) {
            cb(err);
        }, false, {
            headers: {
                "Range": 'bytes=' + this.start + '-'
            }
        });
};
/**
 * 结束下载任务
 */
PRD.prototype.abort = function () {
    this._isAbort = true;
    this.fileTransfer.abort();
};
/**
 * 默认错误处理
 * @param e
 */
function errorHandler(e) {
    var msg = '';

    switch (e.code) {
        case FileError.QUOTA_EXCEEDED_ERR:
            msg = 'QUOTA_EXCEEDED_ERR';
            break;
        case FileError.NOT_FOUND_ERR:
            msg = 'NOT_FOUND_ERR';
            break;
        case FileError.SECURITY_ERR:
            msg = 'SECURITY_ERR';
            break;
        case FileError.INVALID_MODIFICATION_ERR:
            msg = 'INVALID_MODIFICATION_ERR';
            break;
        case FileError.INVALID_STATE_ERR:
            msg = 'INVALID_STATE_ERR';
            break;
        default:
            msg = 'Unknown Error';
            break;
    }

    console.log('Error: ' + msg);
}



module&&(module.exports = PRD);
