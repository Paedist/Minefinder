var bombData = {
    basic : {width: 9, height: 9, bomb: 10},
    medium : {width: 16, height: 16, bomb: 40},
    hard : {width: 30, height: 16, bomb: 99},
}

$("body").on("contextmenu",event => {
    event.preventDefault();
})


/**
 * 테이블의 생성에 필요한 데이터를 반환해줌
 * @param {JQuery} $this 클릭한 버튼의 JQuery 객체
 * @return 만들 테이블의 Object 형식으로 된 데이터
 */
function getTableType($this){
    var classlist = ["basic","medium","hard"]
    var thisClassName;
    classlist.forEach(function(classname){
        if( $this.hasClass(classname) ){
            thisClassName = classname
        }
    })
    return bombData[thisClassName]
}

/**
 * 테이블생성
 * @param {number} width 가로크기
 * @param {number} height 세로크기
 * @param {number} bomb 지뢰갯수
 */
function createTable(width, height, bomb){
    // 테이블에 heigh만큼 tr을 만듬
    $(".gametable").html("<tr></tr>".repeat(height))
    // width만큼 td를 만듬
    $(".gametable tr").html("<td></td>".repeat(width))

    $(".gametable tr").each(function(i){
        var $tr = $(this) 

        $tr.find("td").each(function(j){
            var $td = $(this)
            $td.data("x",j)
            $td.data("y",i)
        })
    })


    $(".gametable").data("bombcount",bomb)
}

/**
 * 폭탄이랑 숫자 설치
 */
var installMine = (function(){
    /**
     * 게임판의 크기만큼 빈 배열을 생성하고 반환
     */
    function getGamePanByArray(){
        var vertical = $(".gamepan tr").length;
        var horizon = $(".gamepan td").length / $(".gamepan tr").length
        var emptyGamepan = []
        for(var i = 0;i < vertical;i++){
            emptyGamepan.push([])
            for(var j = 0;j < horizon;j++){
                emptyGamepan[i].push(null)
            }
        }
        return emptyGamepan
    }


    function 폭탄을놓을랜덤좌표(세로,가로){
        var 랜덤세로좌표 = Math.floor( Math.random() * 세로 )
        var 랜덤가로좌표 = Math.floor( Math.random() * 가로 )

        return {
            x:랜덤가로좌표,
            y:랜덤세로좌표
        }
    }

    function 폭탄을여기에놓아도되니(게임판,좌표,제외할좌표){
        // 제외할 좌표랑 좌표가 똑같으면 부정 반환
        if( 좌표.x === 제외할좌표.x && 좌표.y === 제외할좌표.y )
            return false
            
        /// 게임판에 이미 폭탄이 있으면 부정반환
        if( 게임판[ 좌표.y ][ 좌표.x ] !== null )
            return false

        return true
    }

    function 폭탄을놓자(arrayedGamePan,좌표){
        var { x, y } = 좌표
        arrayedGamePan[y][x] = true;
    }

    /**
     * 빈 게임판에 폭탄 넣기
     * @param {Array} arrayedGamePan 빈 배열 
     * @param {Jquery} $clickedCell 제외할 셀의 Jquery 객체
     */
    function putMine(arrayedGamePan,$clickedCell){
        var [ver, hor] = [ arrayedGamePan.length, arrayedGamePan[0].length]
        var 제외할좌표 = {
            x: $clickedCell.data("x"),
            y: $clickedCell.data("y") 
        }
        var 놓아야하는폭탄 = $(".gametable").data("bombcount")
        
        while(놓아야하는폭탄 !== 0){
            var 좌표 = 폭탄을놓을랜덤좌표(ver,hor)
            if( 폭탄을여기에놓아도되니(arrayedGamePan,좌표,제외할좌표) ){
                폭탄을놓자(arrayedGamePan,좌표)
                놓아야하는폭탄 -= 1
            }
        }
        
        return arrayedGamePan
    }

    function 여기에폭탄이있니(게임판,i,j){
        var [세로길이, 가로길이] = [게임판.length, 게임판[0].length]
        if(i < 0 || j < 0) return false;
        if(i >= 세로길이 || j >= 가로길이) return false
        


        return 게임판[i][j] === true;
    }

    function 이근처에폭탄이몇개나있니(게임판,i,j){
        var 폭탄갯수 = 0;
        var 검사할상대위치 = [
            [-1,-1], [-1,0], [-1,1], [0,-1], [0,1], [1,-1], [1,0], [1,1]
        ]
        검사할상대위치.forEach( (좌표) => {
            var [상대x,상대y] = 좌표
            
            if( 여기에폭탄이있니(게임판, i + 상대y, j + 상대x ) )
                폭탄갯수++
        })

        return 폭탄갯수;
    }

    /**
     * 폭탄이 들어간 게임판에 숫자를 적기
     * @param {Array} arrayedGamePan 폭탄이 들어간 게임판
     */
    function putNumber(arrayedGamePan){
        for( var i = 0; i < arrayedGamePan.length; i++){
            for( var j = 0; j < arrayedGamePan[i].length; j++){
                if( 여기에폭탄이있니(arrayedGamePan,i,j) )
                    continue

                var 폭탄갯수 = 이근처에폭탄이몇개나있니(arrayedGamePan,i,j);
                arrayedGamePan[i][j] = 폭탄갯수;
            }   
        }

        return arrayedGamePan
    }

    function 여기에셀의정보를기록해( i,j,셀의정보 ){
        var $타겟tr = $(".gamepan table tr").eq(i);
        var $타겟td = $타겟tr.find("td").eq(j);
        $타겟td.data("bombdata",셀의정보)

    }

    /**
     * 완벽한 배열 게임판을 html 객체에다 전부 적어놓기
     * @param {Array} putedGamepan 
     */
    function takeHtmlElement(putedGamepan){
        for( var i = 0; i < putedGamepan.length; i++){
            for( var j = 0; j < putedGamepan[i].length; j++){
                var 셀의정보 = putedGamepan[i][j]
                여기에셀의정보를기록해(i,j, 셀의정보)
            }   
        }
    }

    return function($clickedCell){
        var arrayedGamePan = getGamePanByArray()
        var putedGamepan = putMine(arrayedGamePan,$clickedCell)
        putedGamepan = putNumber(putedGamepan)
        takeHtmlElement(putedGamepan)
    }
})()


function isClickedMine($this){
    return $this.data("bombdata") === true
}

function setBackgroundRed($this){
    $this.css("background-color","red")
}

function gameOver($this){
    // 클릭 이벤트를 해제시킨다
    $(".gametable td").off("click").off("contextmenu")

    // 얼굴의 형태를 변형
    changeface("dead")
    // 폭탄일 경우 오픈을 한다
    $(".gametable td").each(function(){
        var $칸 = $(this)
        if( isClickedMine($칸) ){
            openCell($칸)
            setBackgroundRed($칸)
        }
    })
}

/**
 * 해당 좌표에 있는 td 제이쿼리 객체를 가져옴, 
 * 만약에 잘못된 위치를 가져왔을 경우 null 반환
 * @param {number} x좌표 
 * @param {number} y좌표 
 */
function 셀가져오기(x좌표,y좌표){
    var 세로길이 = $(".gamepan tr").length
    var 가로길이 = $(".gamepan tr").eq(0).find("td").length

    if(x좌표 < 0 || y좌표 < 0) return null;
    if(x좌표 >= 세로길이 || y좌표 >= 가로길이) return null;

    return $(".gamepan tr").eq(x좌표).find("td").eq(y좌표)
}

function 상하좌우오픈($this){
    var [x,y] = [$this.data("x"),$this.data("y")]
    var 오픈할상대좌표 = [
        [-1,-1], [-1,0], [-1,1], [0,-1], [0,1], [1,-1], [1,0], [1,1]
    ]

    오픈할상대좌표.forEach(function(상대좌표){
        var [상대x, 상대y] = 상대좌표
        var $td = 셀가져오기(y + 상대y,x + 상대x);
        if( $td === null) return;
        openCell($td)
    })
}

function openCell($this){
    var 폭탄HTML = "<i class='fa fa-bomb'></i>"
    // data에 true, 0,1,2,3,4,~~ 들어있음
    var data = $this.data("bombdata");
    
    // 플레그 데이터를 0으로 갱신
    $this.data( "state", 0 )

    if( $this.hasClass("active") ) return;
    $this.off("click")
    $this.addClass("active")

    
    if( data === true) $this.html(폭탄HTML)
     else {
        $this.html(data)
    }
    if( data === 0 ) 상하좌우오픈($this)

    renewalScreenMineCount();
}

function initclickEvent(){

    var isCellFlag = $this => $this.data("state") === 1;
    var isTableVirgin = () => $("td.active").length === 0 //화살표 함수 

    $(".gametable td").on("click",function(event){
        $this = $(this)
        var [x, y] = [$this.data("x"), $this.data("y")]
        if( isCellFlag($this) ) return;

        if( isTableVirgin() ){
            installMine($this)
            //debugmode()
        }
        
        if( isClickedMine($this) )
            gameOver($this)
        else
            openCell($this)
         
    })

    // 오른쪽 클릭했을때 현재 상태를 업데이트
    function updateState(){
        var state = $this.data("state") || 0
        state = ( state + 1 ) % 3
        $this.data("state",state)
    }

    /**52
     * 암거도없을때/  오른족클릭하면: 깃발
     * 깃발/ 왼쪽:클릭X, 오른쪽클릭시: 물음표
     * 물음표/ 왼쪽:클릭됨, 오른쪽클릭시: 빈공간
     */
    $(".gametable td").on("contextmenu",function(event){
        $this = $(this)
        var htmlstate = {
            "empty" : "",
            "flag" : "<i class='fab fa-font-awesome-flag'></i>",
            "question" : "<i class='fas fa-question'></i>"
        } // 오브젝트 선언

        updateState();
        switch( $this.data("state") ){
            case 0: // 빈칸
                $this.html( htmlstate.empty )
            break;
            case 1: // 깃발
                $this.html( htmlstate.flag )
            break;
            case 2: // 물음표
                $this.html( htmlstate.question )
            break;
        }
        renewalScreenMineCount();
    })
}

function renewalScreenMineCount(){
    var allMineCount = $(".gametable").data("bombcount")
    var allflagCount = $(".gametable td").toArray().reduce(function(thisFlagCount,nextTd){
        var nowState = $(nextTd).data("state") 
        if( nowState === 1 || nowState === 2)
            thisFlagCount++
        return thisFlagCount
    },0)
    $(".minecount").html(allMineCount - allflagCount)
}

function debugmode(){
    $("td").text(function(){
        return $(this).data("bombdata")
    })
}

/**
 * 게임 시작 버튼을 눌렀을때 테이블을 생성합니다
 */
$(".start").on("click",function(){
    var $this = $(this);

    // 버튼에 우리가 제일 마지막에 누른 버튼 표시
    $(".start").removeClass("lastClicked")
    $this.addClass("lastClicked")

    var { width, height, bomb } = getTableType($this)
    $(".minecount").html(bomb);
    var $table = createTable(width,height,bomb)
    initclickEvent( $table )
   
})


$(".face").on("mousedown",function(){
    $(".start.lastClicked").trigger("click")
    changeface("clicked")
})

$(".face").on("mouseup",function(){
    changeface("nonclicked")
})

function changeface(state){
    var $face = $(".face")
    switch(state){
        case "clicked":
            $face.html(`<i class="far fa-surprise"></i>`);
        break;
        case "dead":
            $face.html(`<i class="fas fa-dizzy"></i>`);
        break;
        default:
            $face.html(`<i class="far fa-smile"></i>`);
        break;
    }
}