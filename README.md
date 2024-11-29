# 💡 Item_simulater

<h3>Project - 아이템 시뮬레이터 개발</h3>

AWS RDS, Prisma를 활용하여 데이터베이스를 기반으로한 아이템 시뮬레이터를 구현

<br>

### Itemsim v1.0
> **1.0v :  2024.11.25 ~ 2024.11.29**

<br>

|          박성욱         |
| :--------------------------: |
| <image width="150px" src="https://user-images.githubusercontent.com/119159558/227076242-6e802ef4-4f4e-48f0-8a8a-aa5f4ebdb8b8.png"/> |
| [@WooK1184](https://github.com/WooK1184) |

<br/>

# 💡 시작 가이드
###
<h3>Requirements</h3>
For building and running the application you need:
 
 - Node.js 18.x
 - Npm 9.2.0
 
<h3>Installation</h3>

```
$ git clone https://github.com/WooK1184/Item_sim
$ cd Item_sim
$ cd server
```
#### Run Method
```
$ npm install
$ npm install dotenv
$ npm install prisma @prisma/client
$ npm install jsonwebtoken
$ npm install joi
$ node server.js 
```
---
### Environment
![Visual Studio Code](https://img.shields.io/badge/Visual%20Studio%20Code-007ACC?style=for-the-badge&logo=Visual%20Studio%20Code&logoColor=white)
![Git](https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=Git&logoColor=white)
![Github](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=GitHub&logoColor=white)
![insomnia](https://img.shields.io/badge/Insomnia-4000BF?style=for-the-badge&logo=Insomnia&logoColor=white)

### Config
![npm](https://img.shields.io/badge/npm-CB3837?style=for-the-badge&logo=npm&logoColor=white)        

### Development
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=Javascript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=Node.js&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=MySQL&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=Prisma&logoColor=white)



<br>

   <h3> 📌 기능 소개 </h3>
   
   구현된 리소스 | 설명 |
   -- | --
   필수 기능 | - 인증 미들웨어 구현 <br/>- 생성, 수정, 삭제 관련 API 구현 <br/>- 데이터베이스 모델링 <br/>- 데이터베이스를 이용한 실시간 업데이트 
   추가 기능 | - JWT 인증을 통한 구매, 판매 API 구현 <br/>- 캐릭터 장비 시스템 구현  <br/>- 게임머니 증가 시스템 구현 <br/>- 인벤토리 기능 추가 |
   
<br>

  <h3> 📖 API 명세서 </h3>

 https://www.notion.so/14d394b55f03800cbcd7fff052a7bee8?v=e8fc3374c6a34f62a0521f14950d1313&pvs=4
   
   <br>

   </details>


   ## 시뮬레이터 구조 📺
   
| API 요청 화면 |
| :--------------------------------------------: |
| ![image](https://github.com/user-attachments/assets/56b88d59-3068-49d4-b444-72039e47f63e) |

<br>

 ## 질문과 답변

<h3>비밀번호를 DB에 저장할 때 Hash를 이용했는데, Hash는 단방향 암호화와 양방향 암호화 중 어떤 암호화 방식에 해당할까요? - 비밀번호를 그냥 저장하지 않고 Hash 한 값을 저장 했을 때의 좋은 점은 무엇인가요?</h3>

Hash는 단방향 암호화 방식에 해당되며 해시값을 통해 기존값을 알 수 없기 때문에 보안 강화에 적합하다고 할 수 있습니다. 작은 차이로 값이 변하기 때문에 중복 방지 및 불법 접근 방지도 가능합니다.


<h3>JWT(Json Web Token)을 이용해 인증 기능을 했는데, 만약 Access Token이 노출되었을 경우 발생할 수 있는 문제점은 무엇일까요? - 해당 문제점을 보완하기 위한 방법으로는 어떤 것이 있을까요?</h3>

토근을 통해 누구나 사용자의 민감한 정보에 접근이 가능해집니다.

1. ip주소와 디바이스 정보를 토큰 발급 시 저장하여 이후 요청 시 확인하는 방법
2. 보안이 강화된 https 사용
3. 접속하는 디바이스와 토큰을 묶어서 사용하게 끔 설계


<h3>인증과 인가가 무엇인지 각각 설명해 주세요. - 위 API 구현 명세에서 인증을 필요로 하는 API와 그렇지 않은 API의 차이가 뭐라고 생각하시나요? - 아이템 생성, 수정 API는 인증을 필요로 하지 않는다고 했지만 사실은 어느 API보다도 인증이 필요한 API입니다. 왜 그럴까요?</h3>

인증 : 사용자가 누구인지 확인하는 과정
인가 : 사용자가 특정 리소스 혹은 작업에 대한 권한이 있는지 확인하는 과정

API 인증 유무 차이 : 인증 유무의 차이는 사용자가 해당 요청을 사용함이 데이터 무결성 유지에 부정적인 영향을 끼치느냐로 볼 수 있다고 생각합니다. 공공데이터 혹은 누구나 볼 수 있는 데이터에 대한 요청의 경우 인증이 불필요할 수 있지만 특정 계정에 대한 캐릭터 생성 혹은 아이템 구매, 판매 등은 게임 자체 밸런스를 해칠 수 있기 때문에 인증이 필요하다 생각합니다.

아이템 생성, 수정 API가 인증이 필요한 이유 : 첫 번째로 게임 밸런스 및 경제 파괴입니다. 아무 사용자나 아이템을 생성하고 수정할 수 있으면 언밸런스한 아이템이 무분별하고 생성될 것이고 이는 곧 게임 밸런스, 경제를 파괴하게 될 것입니다. 두 번째로 리소스 오남용으로 인한 시스템 성능 저하를 유발할 수 있습니다.


<h3>과제를 진행하면서 사용한 Http Status Code를 모두 나열하고, 각각이 의미하는 것과 어떤 상황에 사용했는지 작성해 주세요.</h3>

200 : 요청이 성공적으로 처리됨(일반적으로 GET 요청)
201 : 요청이 성공적으로 처리, 리소스 생성(일반적으로 POST 요청)
400 : 클라이언트의 요청이 잘못되었음
401 : 인증이 필요함(JWT 인증필요)
403 : 접근 권한이 없음
404 : 요청한 리소스가 존재하지 않음
500 : 서버 내 오류 발생


<h3>현재는 간편한 구현을 위해 캐릭터 테이블에 money라는 게임 머니 컬럼만 추가하였습니다. - 이렇게 되었을 때 어떠한 단점이 있을 수 있을까요? - 이렇게 하지 않고 다르게 구현할 수 있는 방법은 어떤 것이 있을까요? - 아이템 구입 시에 가격을 클라이언트에서 입력하게 하면 어떠한 문제점이 있을 수 있을까요?</h3>

하나의 칼럼만 존재한다면 요청 이후 결과 값만 저장되기 때문에 구매, 판매에 대한 변경 내역이 없기에 디버깅을 하기 어렵고 외부에서 악의적인 조작에 대한 내역 또한 확인이 어렵게 됩니다. 또한 추후 게임 업그레이드 시 다양한 방법을 통한 게임 경제를 구현하기 어렵게 됩니다.

하나의 칼럼이 아닌 거래내역 부분을 추가로 생성하여 관리하거나  트랜잭션으로 처리하여 데이터 무결성을 유지할 수 있을 것 같습니다.

클라이언트가 가격을 입력하게 되면 가격 조작으로 인한 데이터 무결성 유지가 어렵게 되고 이는 곧 게임 경제를 파괴하게 될 것입니다. 추후 다른 플레이어와의 밸런스 또한 무너지게 될 것으로 예상됩니다.



