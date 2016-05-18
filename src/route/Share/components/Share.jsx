import React from 'react';
import reqwest from 'reqwest';
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
      lagePic: false
    }
    this.fetch = this.fetch.bind(this);
    this.renderPicVideo = this.renderPicVideo.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.renderLive = this.renderLive.bind(this);
    this.renderVideo = this.renderVideo.bind(this);
    this.handleClickPic = this.handleClickPic.bind(this);
    this.toSmallPic = this.toSmallPic.bind(this);
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
          //获取频道内容
          if (result.data.type == 1) {
            const views = result.data.content.views;
            this.setState({info: info, content: content, is_picture: false, views: views});
            this.fetchChannelComment();

          } else {
            this.setState({info: info, content: content, is_picture: true, cover: info.cover})
          }
        } else {
          //获取频道的评论
          const commentInfo = result.data.comment_info;
          this.setState({commentInfo: commentInfo})
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

  handleChange(key) {
    console.log(key)
    if (key == 2) {
      params = {
        // app:1,
        // cid:20,
        app: GetQueryString("app"),
        cid: GetQueryString("cid"),
        size: 10,
        service: 'Share.GetChannelComment'
      }
      this.fetch();
    }
  }

  renderPicVideo() {
    const {is_picture, cover, views} = this.state;
    if (is_picture) {
      return (<img src={cover} style={{
        width: '100%',
        height: '20rem'
      }}/>)
    } else {
      let playUrl = views[0].play_list[0].play_url;
      return (
        <video id="video1" width="100%" height='375' controls>
          <source src={playUrl} type="video/mp4"/>
        </video>
      )
    }
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
      for (let k = 0; k < picVideo.length; k++) {
        picVideoList += `<img style='margin-top:10px' onclick='window.self.handleClickPic(${i},${k})' width='80px' src=${picVideo[k]}>&nbsp;`
      }
      // console.log(picVideo);
      console.log(attachment);
      comment += `
        <Row>
          <Row>
            <div class='col-4'>
              <img class='border-radius' width='35px' src='${content[i].icon_url}' />
            </div>
            <div class='col-20 renderLiveContent' style='padding:8px'>
              <div class='col-10'>${content[i].name}</div>
              <div class='col-14' style='text-align:right'>${content[i].time}</div>
              <br />
              <div>&nbsp;&nbsp;${content[i].content}</div>
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
          ${commentInfo[i].nick_name}: ${commentInfo[i].content}
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
    setInterval((function() {
      this.fetch();
    }.bind(this)), 10000)
  }

  render() {
    const {is_picture, info, carouse, lagePic} = this.state;
    const screenHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
    let bigPicStyle = {
      height: screenHeight
    }
    if (lagePic) {
      return <div style={bigPicStyle} className='bigPicDisplay'>{carouse}</div>
    }
    return (
      <article>
        <content className='shareContent'>
          <header className='contentPicVio' style={is_picture
            ? {
              height: '20rem'
            }
            : {
              height: '375'
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
                <Tag>
                  <Icon type="caret-right"/>直播{info.total_watch_num || 0}人
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
      </article>
    )
  }
};

export default RoomShare;
