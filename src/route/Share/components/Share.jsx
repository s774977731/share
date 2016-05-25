import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import reqwest from 'reqwest';
import ReactHowler from 'react-howler'
// import ReactAudioPlayer from 'react-audio-player';
// var player = require('hymn');
import {
  Button,
  Icon,
  Tag,
  Tabs,
  message,
  Row,
  Carousel
} from 'antd';
const TabPane = Tabs.TabPane;

function GetQueryString(name) {
  var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
  var r = window.location.search.substr(1).match(reg);
  if (r != null)
    return unescape(r[2]);
  return null;
}


//判断手机型号
function checkUrl() {
  var u = navigator.userAgent;
  console.log(u)
  if (u.indexOf('Android') > -1 || u.indexOf('Linux') > -1) { //安卓手机
    // alert("安卓手机");
    window.location.href = "http://7xrdm6.com1.z0.glb.clouddn.com/download%2Flivewenzhou.apk";
  } else if (u.indexOf('iPhone') > -1) { //苹果手机
    window.location.href = "https://itunes.apple.com/cn/app/zhi-bo-wen-zhou/id1098528641?mt=8";
    // alert("苹果手机");
  } else if (u.indexOf('Windows Phone') > -1) { //winphone手机
    alert("暂时不支持windowPhone");
    // window.location.href = "mobile/index.html";
  }
}

let params = {
  // app:1,
  // cid:20,
  app: GetQueryString("app"),
  cid: GetQueryString("cid"),
  service: 'Share.GetChannelContent'
}
console.log(GetQueryString("app"), GetQueryString("cid"));

var publicUrl = 'http://bi.webei.cn/video';

class RoomShare extends React.Component {

  constructor() {
    super();
    this.state = {
      is_picture: true,
      views: [],
      info: {},
      content: [],
      commentInfo: [],
      cover: '',
      carouselPic: [],
      lagePic: false,
      audioSrc:'http://7xrdm6.com2.z0.glb.qiniucdn.com/0_audio_21_1464055023_9247.mp3',
      play:false,
      loading:false,
      showVideo:false,
    }
    this.fetch = this.fetch.bind(this);
    this.renderPicVideo = this.renderPicVideo.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.renderLive = this.renderLive.bind(this);
    this.renderVideo = this.renderVideo.bind(this);
    this.handleClickPic = this.handleClickPic.bind(this);
    this.toSmallPic = this.toSmallPic.bind(this);
    this.clickAudio = this.clickAudio.bind(this);
    this.handleClickAdd = this.handleClickAdd.bind(this);
    this.showVideo = this.showVideo.bind(this);
  }

  fetch() {
    reqwest({
      url: publicUrl,
      method: 'get',
      data: params,
      type: 'jsonp',
      withCredentials: true,
      success: (result) => {
        console.log(result.data);

        if (result.data.content) {
          const info = result.data.chan_info;
          const content = result.data.content;
          document.title = info.name;
          //获取频道内容
          if (result.data.type == 1) {
            this.tabkey = 2;
            const views = result.data.content.views;
            this.setState({info: info, content: content, is_picture: false, views: views});
            this.fetchChannelComment();
          } else {
            this.tabkey = 1;
            this.setState({info: info, content: content, is_picture: true, cover: info.cover})
          }
          // console.log(content);
        } else {
          //获取频道的评论
          const commentInfo = result.data.comment_info;
          this.tabkey = 2;
          this.setState({
            commentInfo: commentInfo,
          });
        }
      }
    });
  }

  fetchChannelComment() {
    params = {
      // app:1,
      // cid:6,
      app: GetQueryString("app"),
      cid: GetQueryString("cid"),
      size: 10,
      service: 'Share.GetChannelComment'
    }
    reqwest({
      url: publicUrl,
      method: 'get',
      data: params,
      type: 'jsonp',
      withCredentials: true,
      success: (result) => {
        const commentInfo = result.data.comment_info;
        this.setState({commentInfo: commentInfo})
      },
      error: (err) => {
        switch (err.status) {
          case 404:
            message.error('删除失败，请联系官方人员！');
            break;
          default:
            message.error('删除失败，请稍后重试！');
            break;
        }
      }
    });
  }

  handleClickAdd() {
    const { content, commentInfo } = this.state;
    this.autoload = true;
    var params;
    var lastContent;
    if(this.tabkey == 1) {
      let  i = content.length;
      lastContent = content[i-1];
      console.log(lastContent);
      params = {
        app: GetQueryString("app"),
        cid: GetQueryString("cid"),
        service: 'Share.GetChannelContent',
        to_id:lastContent.id
      };
    }
    if(this.tabkey == 2) {
      let  j = commentInfo.length;
      lastContent = commentInfo[j-1];
      console.log(lastContent);
      params = {
        app: GetQueryString("app"),
        cid: GetQueryString("cid"),
        size:10,
        service: 'Share.GetChannelCommentByFlow',
        to_id:lastContent.comment_id
      };
    }
    this.setState({loading:true});
    reqwest({
      url: publicUrl,
      method: 'get',
      data: params,
      type: 'jsonp',
      withCredentials: true,
      success: (result) => {
        if(this.tabkey == 1) {
          console.log(content.concat(result.data.content));
          this.setState({
            content:content.concat(result.data.content),
            loading:false
          })
        }
        if(this.tabkey == 2) {
          console.log(result.data);
          console.log(commentInfo.concat(result.data.comment_info));
          this.setState({
            commentInfo:commentInfo.concat(result.data.comment_info),
            loading:false
          })
        }
      }
    });
  }

  handleChange(key) {
    this.setState({key:key});
    this.tabkey = key;
    console.log(this.tabkey,key);
    if (key == 2) {
      params = {
        // app:1,
        // cid:20,
        app: GetQueryString("app"),
        cid: GetQueryString("cid"),
        size:10,
        service: 'Share.GetChannelComment'
      }
      this.fetch();
    }
  }

  renderPicVideo() {
    const {is_picture, cover, views, content, showVideo } = this.state;
    if (is_picture) {
      return (<img src={cover} style={{
        width: '100%',
        height: '235px'
      }}/>)
    } else {
      let playUrl = views[0].play_list[0].play_url;

      if(showVideo) {
        return (
          <div className='textCenter'>
            <video id="video1" height='235px' autoPlay controls>
              <source src={playUrl} type="video/mp4"/>
              <source src={playUrl} type="video/ogg"/>
            </video>
          </div>
        )
      }
      return (
        <div style={{color:'#F1F1F1'}}>
          <img src={content.cover} style={{
            width: '100%',
            height: '235px'
          }}/>
        <Icon className='transformscale3' style={{transform:'scale(3)',position:'absolute',top:'10rem',right:'180px'}} onClick={this.showVideo} type="caret-circle-o-right" />
        </div>
      )
    }
  }

  showVideo() {
    this.setState({
      showVideo:true
    })
  }

  renderDetailPic(i, num) {
    const {content, is_picture} = this.state;
    const attach = content[i].attachment;
    let livePicList = [];
    if (is_picture) {
      if (num == 1) {
        for (var j = 0; j < attach.length; j++) {
          livePicList.push(attach[j].cover)
          // console.log(livePicList);
        }
        return livePicList
      } else if (num == 2) {
        for (var j = 0; j < attach.length; j++) {
          livePicList.push(attach[j].file)
        }
        // console.log(livePicList);
        return livePicList
      }

    } else {}
  }

  handleClickPic(i, k) {
    const {carouselPic, content} = this.state;
    let picVideo = this.renderDetailPic(i, 2);
    var carouseList;
    let attachment = content[i].attachment;
    this.setState({carouselPic: picVideo})
    //renderCarousel
    var settings = {
      dots: true,
      infinite: false,
      initialSlide: 0,
      slidesToShow: 1,
      slidesToScroll: 1
    };
    carouseList = <div>
      <div align='center'><img src='./zbwz.png'/>11</div>
    </div>;
    if (this.state.carouselPic.length > 0) {
      var carouselPict = this.state.carouselPic;
      var List;
      for (var j = 0; j < carouselPict.length; j++) {
        if (attachment[k].type == 1) {
          List = <div><img onClick={this.toSmallPic} src={carouselPict[k]} width='100%'/></div>;
        } else {
          List = <div onClick={this.toSmallPic}>
            <video width="100%" height='375' controls>
              <source src={carouselPict[k]} type="video/mp4"/>
            </video>
          </div>;
        }
      }
      carouseList = <div>{List}</div>
    }
    //   let carouse = <Carousel {...settings}>
    //   {carouseList.props.children}
    // </Carousel>;
    let carouse = carouseList;
    this.setState({lagePic: true, carouse: carouse})
    console.log(i, k, this.state.carouselPic)
    // console.log(carouseList)
  }

  clickAudio(i) {
    const { content, play } = this.state;
    let source = content[i].attachment[0];
    let vidoeContent = document.getElementById('audio');
    // console.log(source,vidoeContent);
    this.setState({
      audioSrc:source.file,
      play:!this.state.play
    })
    if(!play) {
      vidoeContent.innerHTML = '暂停播放'
    }else {
      vidoeContent.innerHTML = '播放语音'
    }

  }

  toSmallPic() {
    this.setState({lagePic: false})
  }

  renderLive() {
    const {content} = this.state;
    window.self = this;
    var attachment = [];
    var comment = ``;
    var imgList = ``;
    for (var i = 0; i < content.length; i++) {
      attachment = content[i].attachment;
      const picVideo = this.renderDetailPic(i, 1);
      window.picVideo = picVideo;
      var picVideoList = ``;
      if(picVideo.length == 1) {
        if(attachment[0].type == 3) {
          //语音
          picVideoList = `<div class='ant-tag'><span class='ant-tag-text' id='audio' onclick='window.self.clickAudio(${i})'>播放语音</span></div>`
        }else if(attachment[0].type == 2){
          //视频
          for (let k = 0; k < picVideo.length; k++) {
            picVideoList +=
            `
            <div style='text-align:center;color:#F1F1F1' onclick='window.self.handleClickPic(${i},${k})'>
                <i class='anticon anticon-caret-circle-o-right transformscale2' style='position:absolute;left:47%;bottom:75px'></i>
              <img src=${picVideo[k]} width='100%' height='150px'/>
            </div>
            `
          }
        }else {
          //图片
          for (let k = 0; k < picVideo.length; k++) {
            picVideoList += `<img style='margin-top:10px' onclick='window.self.handleClickPic(${i},${k})' width='100%' src=${picVideo[k]}>&nbsp;`
          }
        }
      }
      if(picVideo.length > 1) {
        for (let k = 0; k < picVideo.length; k++) {
          picVideoList += `<img style='margin-top:10px' onclick='window.self.handleClickPic(${i},${k})' width='70px' height='55px' src=${picVideo[k]}>&nbsp;`
        }
      }
      // console.log(picVideo);
      // console.log(attachment);
      comment += `
        <Row>
          <Row>
            <div class='col-4'>
              <img class='border-radius' width='35px' src='${content[i].icon_url}' />
            </div>
            <div class='col-20 renderLiveContent' style='padding:8px'>
              <div class='col-10'><span style='color:#4A7AB4'>${content[i].name}</span></div>
              <div class='col-14' style='text-align:right'>${content[i].time}</div>
              <br />
              <div>&nbsp;&nbsp;${content[i].content}</div>
              <div class='smallTriangle'></div>
              ${picVideoList}
            </div>

          </Row>
          <Row><div>&nbsp;</div></Row>
        </Row>
      `
    }
    return {__html: comment};
  }

  renderComment() {
    const {commentInfo} = this.state;
    var comment = ``;
    for (var i = 0; i < commentInfo.length; i++) {
      comment += `
      <Row>
        <div class='col-4'>
          <img class='border-radius' width='35px' src='${commentInfo[i].portrait}' />
        </div>
        <div class='col-20 renderLiveContent' style='padding:8px'>
          <div class='smallTriangle'></div>
          <span style='color:#4A7AB4'>${commentInfo[i].nick_name}</span>: ${commentInfo[i].content}
        </div>
      </Row>
      <Row><div>&nbsp;</div></Row>
      `
    }
    return {__html: comment};
  }

  //渲染图文
  renderPicture() {
    const commentDetail = {
      border: '1px solid gray',
      backgroundColor: '#FFFFFF',
      minHeight: '3.2rem',
      fontSize: '1.5rem',
      padding: '8px'
    }
    return (
      <Tabs onChange={this.handleChange} type="card" size="small">
        <TabPane tab="直播" key="1">
          <div dangerouslySetInnerHTML={this.renderLive()}/>
        </TabPane>
        <TabPane tab="评论" key="2">
          <Row style={{
            marginBottom: '15px'
          }}>
            <div className='col-4' style={{
              minHeight: '3.2rem'
            }}>
              <img className='border-radius' src='http://7xrdm6.com2.z0.glb.qiniucdn.com/1_image_a64_1463102646_6116image/jpeg'/>
            </div>
            <div className='col-20' style={commentDetail}>
              下载客户端后可发表评论！~
            </div>
          </Row>
          <div dangerouslySetInnerHTML={this.renderComment()}/>
        </TabPane>
      </Tabs>
    )
  }

  //渲染视频
  renderVideo() {
    return (<div dangerouslySetInnerHTML={this.renderComment()}/>)
  }

  componentWillMount() {
    //app=1 图文 cid=20 视频 cid=6
      this.fetch();

  }

  componentDidMount() {
    //app=1 图文 cid=20 视频 cid=6
    // setInterval((function() {
    //   if(this.autoload) {
    //     return;
    //   }
    //   this.fetch();
    // }.bind(this)), 10000)
  }

  render() {
    const {is_picture, info, carouse, lagePic, audioSrc, play, loading } = this.state;
    const screenHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
    let bigPicStyle = {
      height: screenHeight
    }
    if (lagePic) {
      return <div style={bigPicStyle} className='bigPicDisplay'>{carouse}</div>
    }
    return (
      <article>
        <ReactHowler
          src={audioSrc}
          playing={play}
        />
        <content className='shareContent'>
          <header className='contentPicVio' style={is_picture
            ? {
              height: '235px'
            }
            : {
              height: '235px'
            }}>
            {this.renderPicVideo()}
          </header>
          <div style={{
            marginTop: '10px'
          }}>
            <div className='box' style={{
              fontSize: '1.5rem'
            }}>
              <div className='boxLeft'>
                <Tag style={{backgroundColor:'#474641',color:'#fff'}}>
                  <Icon type="caret-right"/>观看{info.total_watch_num || 0}人
                </Tag>
              </div>
              <div className='boxMiddle'>
                <strong>{info.name}</strong>
              </div>
              <div className='boxRight'>
              </div>
            </div>
            <div className='contentMain'>
              {is_picture
                ? this.renderPicture()
                : this.renderVideo()}
            </div>
          </div>
        </content>
        <div onClick={this.handleClickAdd} className='textCenter' style={{width:'100%',marginBottom:'2rem'}}>
          <div className='col-16 col-offset-4' style={{backgroundColor:'#F1F1F1',height:'3.5rem',lineHeight:'3.5rem'}} >
            { !loading ? '点击加载更多' : '加载中...'}
          </div>
        </div>
        {/*
          <footer className='shareFooter'>
            <div className='col-6'>
              <img src='./zbwz.png' width='55px' alt='直播温州'/>
            </div>
            <div className='col-12'>
              <div style={{
                fontSize: '1.5rem'
              }}>
                <strong>下载直播温州</strong>
              </div>
              <div style={{
                color: 'gray'
              }}>精彩直播，一手资讯，尽在掌握</div>
            </div>
            <div className='col-6'>
              <Tag className='tagStyle' style={{
                backgroundColor: '#F04042',
                color: '#FFFFFF'
              }} onClick={checkUrl}>下载</Tag>
            </div>
          </footer>
          */}
          <div className='col-24' style={{height:'3.5rem',width:'100%',opacity:'0'}}>1111</div>
      </article>
    )
  }
};

export default RoomShare;
