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

var timerInterval;
function startTimer(){
    endTimer()
    $(".minetime").html("00");
    timerInterval = setInterval(function(){
        $(".minetime").html(function(i,nowHtml){
            return (parseInt(nowHtml) + 1).toString().padStart(2,0)
        })
    },1000)
}

function endTimer(){
    clearInterval(timerInterval)
}


/**
 * 테이블생성
 * @param {number} width hor크기
 * @param {number} height ver크기
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
    startTimer()
}

/**
 * 폭탄이랑 숫자 설치
 */
var installMine = (function(){
    /**
     * gamePan의 크기만큼 빈 배열을 생성하고 반환
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


    function putRandomBombPoint(ver,hor){
        var randomVerPoint = Math.floor( Math.random() * ver )
        var randomHorPoint = Math.floor( Math.random() * hor )

        return {
            x:randomHorPoint,
            y:randomVerPoint
        }
    }

    function isPutBombHere(gamePan,point,exceptionPoint){
        // 제외할 point랑 point가 똑같으면 부정 반환
        if( point.x === exceptionPoint.x && point.y === exceptionPoint.y )
            return false
            
        /// gamePan에 이미 폭탄이 있으면 부정반환
        if( gamePan[ point.y ][ point.x ] !== null )
            return false

        return true
    }

    function putBomb(arrayedGamePan,point){
        var { x, y } = point
        arrayedGamePan[y][x] = true;
    }

    /**
     * 빈 gamePan에 폭탄 넣기
     * @param {Array} arrayedGamePan 빈 배열 
     * @param {Jquery} $clickedCell 제외할 셀의 Jquery 객체
     */
    function putMine(arrayedGamePan,$clickedCell){
        var [ver, hor] = [ arrayedGamePan.length, arrayedGamePan[0].length]
        var exceptionPoint = {
            x: $clickedCell.data("x"),
            y: $clickedCell.data("y") 
        }
        var haveToPutBomb = $(".gametable").data("bombcount")
        
        while(haveToPutBomb !== 0){
            var point = putRandomBombPoint(ver,hor)
            if( isPutBombHere(arrayedGamePan,point,exceptionPoint) ){
                putBomb(arrayedGamePan,point)
                haveToPutBomb -= 1
            }
        }
        
        
        return arrayedGamePan
    }

    function isBombHere(gamePan,i,j){
        var [col_len, row_len] = [gamePan.length, gamePan[0].length]
        if(i < 0 || j < 0) return false;
        if(i >= col_len || j >= row_len) return false
        


        return gamePan[i][j] === true;
    }

    function isNearBombNumber(gamePan,i,j){
        var bombNum = 0;
        var 검사할상대위치 = [
            [-1,-1], [-1,0], [-1,1], [0,-1], [0,1], [1,-1], [1,0], [1,1]
        ]
        검사할상대위치.forEach( (point) => {
            var [relX,relY] = point
            
            if( isBombHere(gamePan, i + relY, j + relX ) )
                bombNum++
        })

        return bombNum;
    }

    /**
     * 폭탄이 들어간 gamePan에 숫자를 적기
     * @param {Array} arrayedGamePan 폭탄이 들어간 gamePan
     */
    function putNumber(arrayedGamePan){
        for( var i = 0; i < arrayedGamePan.length; i++){
            for( var j = 0; j < arrayedGamePan[i].length; j++){
                if( isBombHere(arrayedGamePan,i,j) )
                    continue

                var bombNum = isNearBombNumber(arrayedGamePan,i,j);
                arrayedGamePan[i][j] = bombNum;
            }   
        }

        return arrayedGamePan
    }

    function writeCellinfo( i,j,CellInfo ){
        var $타겟tr = $(".gamepan table tr").eq(i);
        var $타겟td = $타겟tr.find("td").eq(j);
        $타겟td.data("bombdata",CellInfo)

    }

    /**
     * 완벽한 배열 gamePan을 html 객체에다 전부 적어놓기
     * @param {Array} putedGamepan 
     */
    function takeHtmlElement(putedGamepan){
        for( var i = 0; i < putedGamepan.length; i++){
            for( var j = 0; j < putedGamepan[i].length; j++){
                var CellInfo = putedGamepan[i][j]
                writeCellinfo(i,j, CellInfo)
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

function gameOver(){
    // 클릭 이벤트를 해제시킨다
    $(".gametable td").off("click").off("contextmenu")

    // 얼굴의 형태를 변형
    changeface("dead")

    // 타이머 정지
    endTimer()
    // 폭탄일 경우 오픈을 한다
    $(".gametable td").each(function(){
        var $td = $(this)
        if( isClickedMine($td) ){
            openCell($td)
            setBackgroundRed($td)
        }
    })
}

function gameWin(){
    // 클릭 이벤트를 해제시킨다
    $(".gametable td").off("click").off("contextmenu")

    // 얼굴의 형태를 변형
    changeface("win")

    // 타이머 정지
    endTimer()
}

/**
 * 해당 point에 있는 td 제이쿼리 객체를 가져옴, 
 * 만약에 잘못된 위치를 가져왔을 경우 null 반환
 * @param {number} x_point 
 * @param {number} y_point 
 */
function getCell(x_point,y_point){
    var col_len = $(".gamepan tr").length
    var row_len = $(".gamepan tr").eq(0).find("td").length

    if(x_point < 0 || y_point < 0) return null;
    if(x_point >= col_len || y_point >= row_len) return null;

    return $(".gamepan tr").eq(x_point).find("td").eq(y_point)
}

function zero_all_open($this){
    var [x,y] = [$this.data("x"),$this.data("y")]
    var openRelPoint = [
        [-1,-1], [-1,0], [-1,1], [0,-1], [0,1], [1,-1], [1,0], [1,1]
    ]

    openRelPoint.forEach(function(relPoint){
        var [relX, relY] = relPoint
        var $td = getCell(y + relY,x + relX);
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
    $this.off("click").off("contextmenu")
    $this.addClass("active")

    
    if( data === true) $this.html(폭탄HTML)
     else {
        $this.html(data)
    }
    if( data === 0 ) zero_all_open($this)

    // 화면의 지뢰 개수를 갱신
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

        // 액티브되지않은 셀 갯수랑 총 폭탄 갯수가 같으면 게임 승리
        if( $("td").not(".active").length === $(".gametable").data("bombcount") ){
            gameWin();
        }
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
    $(".minecount").html(parseInt(allMineCount - allflagCount).toString().padStart(2,0))
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

    // 얼굴초기화
    changeface("nonclicked")

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
        case "win":
            $face.html('<i class="fas fa-trophy"></i>');
            break;
        default:
            $face.html(`<i class="far fa-smile"></i>`);
        break;
    }
}