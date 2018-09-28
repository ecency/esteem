# [eSteem](https://esteem.app) Mobile

**eSteem Mobile** 은 2016년  [Feruz Muradov](https://steemit.com/@good-karma)에 의해 설립된 블로깅, 댓글 및 큐레이터에 대한 보상을 받고 eSteem 팀과 Steem 커뮤니티의 지원을 받는 Android 및 iOS용 소셜 애플리케이션입니다.

![07.png](https://steemitimages.com/DQmZiTtGN1rrZgVSc1sqVqo1H3C3gezuyFeEJaCojrKiiUG/07.png)

# Main eSteem features 

- 여러분이 관심 있는 어떤 주제의 글이라도 접근할 수 있다.
- 저자들과 주제에 대해서 댓글이나 토론에 참여할 수 있다.
- Voting for posts to reward author as well as earn curation reward.
- Publish your articles, blog posts and host them for free and earn rewards by engaging and gain followers.
- Write articles on go, save multiple drafts of the post for later publication.
- Bookmark favorite articles to read later.
- Exchange or cash out your earnings.
- Send your funds to any authors or users, friends, followers, etc.
- Follow interesting authors, bloggers.
- Search your followers and authors you are following.
- Get notifications to stay in touch with your followers and discussions you are involved in.
- Search for interesting tags/categories of articles, authors.
- Personalize your profile.
- Many more features to come.


# Security

1. App never access or hold onto user funds.
2. App offer a client-side security model, with private keys hosted locally and never sent to any servers, you are responsible to backing up your passwords.
3. App offers simple, attractive user interfaces and experiences
4. App offers extra layer of security with pin-code

## Development
~~`npm install -g ionic@latest`~~

~~`npm install -g cordova`~~

~~`npm install -g gulp`~~
###### 모듈 설치

ionic 최신 버전에서는 빌드가 되지 않는다. 2.x.x 버전을 설치한다.

`npm install -g ionic@2.3.0 cordova gulp semver`
또는
`yarn global add gulp semver cordova ionic@2.2.3`

`npm install`

`bower install`

###### 빌드하기
`gulp scripts`

###### 각 플랫폼별 결과물 테스트
`ionic serve --lab`

###### 브라우저에서 실행
`ionic serve dev`

###### 안드로이드로 실행
`ionic cordova run android`

###### 플랫폼별 빌드
```
ionic cordova build android
ionic cordova build ios
```

Start developing with Ionic.


Please use [issue tracker](https://github.com/feruzm/esteem/issues) for questions or feedbacks

### Steem이란?

Steem은 누구나 보상을 받을 수 있는 블록체인 기반의 소셜 미디어 플랫폼입니다. Steem 블록체인은 STEEM이라고하는 암호 토큰을 보유 할뿐만 아니라 사용자가 만든 콘텐츠, 해당 콘텐츠에 투표하는 시스템 및 인기 소셜 네트워킹 사이트에서 찾을 수 있는 많은 다른 기능을 보유하고 있습니다.

개발 및 프로젝트에 대한 자세한 정보는 http://www.esteem.app를 방문하십시오.


# License

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.