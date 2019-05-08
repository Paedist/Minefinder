var bombData = {
    basic : {width: 9, height: 9, bomb: 10},
    medium : {width: 16, height: 16, bomb: 40},
    hard : {width: 30, height: 16, bomb: 99},
}


/**
 * ���̺��� ������ �ʿ��� �����͸� ��ȯ����
 * @param {JQuery} $this Ŭ���� ��ư�� JQuery ��ü
 * @return ���� ���̺��� Object �������� �� ������
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
 * ���̺����
 * @param {number} width ����ũ��
 * @param {number} height ����ũ��
 * @param {number} bomb ���ڰ���
 */
function createTable(width, height, bomb){
    // ���̺� heigh��ŭ tr�� ����
    $(".gametable").html("<tr></tr>".repeat(height))
    // width��ŭ td�� ����
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
 * ��ź�̶� ���� ��ġ
 */
var installMine = (function(){
    /**
     * new Array(10).fill([]).mapmap(v => new Array(10).fill([]))
     * �ٷ� 10x10 �迭 �����
     */
    /**
     * �������� ũ�⸸ŭ �� �迭�� �����ϰ� ��ȯ
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


    function ��ź������������ǥ(����,����){
        var ����������ǥ = Math.floor( Math.random() * ���� )
        var ����������ǥ = Math.floor( Math.random() * ���� )

        return {
            x:����������ǥ,
            y:����������ǥ
        }
    }

    function ��ź�����⿡���Ƶ��Ǵ�(������,��ǥ,��������ǥ){
        // ������ ��ǥ�� ��ǥ�� �Ȱ����� ���� ��ȯ
        if( ��ǥ.x === ��������ǥ.x && ��ǥ.y === ��������ǥ.y )
            return false
            
        /// �����ǿ� �̹� ��ź�� ������ ������ȯ
        if( ������[ ��ǥ.y ][ ��ǥ.x ] !== null )
            return false

        return true
    }

    function ��ź������(arrayedGamePan,��ǥ){
        var { x, y } = ��ǥ
        arrayedGamePan[y][x] = true;
    }

    /**
     * �� �����ǿ� ��ź �ֱ�
     * @param {Array} arrayedGamePan �� �迭 
     * @param {Jquery} $clickedCell ������ ���� Jquery ��ü
     */
    function putMine(arrayedGamePan,$clickedCell){
        var [ver, hor] = [ arrayedGamePan.length, arrayedGamePan[0].length]
        var ��������ǥ = {
            x: $clickedCell.data("x"),
            y: $clickedCell.data("y") 
        }
        var ���ƾ��ϴ���ź = $(".gametable").data("bombcount")
        
        while(���ƾ��ϴ���ź !== 0){
            var ��ǥ = ��ź������������ǥ(ver,hor)
            if( ��ź�����⿡���Ƶ��Ǵ�(arrayedGamePan,��ǥ,��������ǥ) ){
                ��ź������(arrayedGamePan,��ǥ)
                ���ƾ��ϴ���ź -= 1
            }
        }
        
        return arrayedGamePan
    }

    function ���⿡��ź���ִ�(������,i,j){
        var [���α���, ���α���] = [������.length, ������[0].length]
        if(i < 0 || j < 0) return false;
        if(i >= ���α��� || j >= ���α���) return false
        


        return ������[i][j] === true;
    }

    function �̱�ó����ź�̸���ִ�(������,i,j){
        var ��ź���� = 0;
        var �˻��һ����ġ = [
            [-1,-1], [-1,0], [-1,1], [0,-1], [0,1], [1,-1], [1,0], [1,1]
        ]
        �˻��һ����ġ.forEach( (��ǥ) => {
            var [���x,���y] = ��ǥ
            
            if( ���⿡��ź���ִ�(������, i + ���y, j + ���x ) )
                ��ź����++
        })

        return ��ź����;
    }

    /**
     * ��ź�� �� �����ǿ� ���ڸ� ����
     * @param {Array} arrayedGamePan ��ź�� �� ������
     */
    function putNumber(arrayedGamePan){
        for( var i = 0; i < arrayedGamePan.length; i++){
            for( var j = 0; j < arrayedGamePan[i].length; j++){
                if( ���⿡��ź���ִ�(arrayedGamePan,i,j) )
                    continue

                var ��ź���� = �̱�ó����ź�̸���ִ�(arrayedGamePan,i,j);
                arrayedGamePan[i][j] = ��ź����;
            }   
        }

        return arrayedGamePan
    }

    function ���⿡���������������( i,j,�������� ){
        var $Ÿ��tr = $(".gamepan table tr").eq(i);
        var $Ÿ��td = $Ÿ��tr.find("td").eq(j);
        $Ÿ��td.data("bombdata",��������)

    }

    /**
     * �Ϻ��� �迭 �������� html ��ü���� ���� �������
     * @param {Array} putedGamepan 
     */
    function takeHtmlElement(putedGamepan){
        for( var i = 0; i < putedGamepan.length; i++){
            for( var j = 0; j < putedGamepan[i].length; j++){
                var �������� = putedGamepan[i][j]
                ���⿡���������������(i,j, ��������)
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
    // Ŭ�� �̺�Ʈ�� ������Ų��
    $(".gametable td").off("click")
    // ��ź�� ��� ������ �Ѵ�
    $(".gametable td").each(function(){
        var $ĭ = $(this)
        if( isClickedMine($ĭ) ){
            openCell($ĭ)
            setBackgroundRed($ĭ)
        }
    })
}

/**
 * �ش� ��ǥ�� �ִ� td �������� ��ü�� ������, 
 * ���࿡ �߸��� ��ġ�� �������� ��� null ��ȯ
 * @param {number} x��ǥ 
 * @param {number} y��ǥ 
 */
function ����������(x��ǥ,y��ǥ){
    var ���α��� = $(".gamepan tr").length
    var ���α��� = $(".gamepan tr").eq(0).find("td").length

    if(x��ǥ < 0 || y��ǥ < 0) return null;
    if(x��ǥ >= ���α��� || y��ǥ >= ���α���) return null;

    return $(".gamepan tr").eq(x��ǥ).find("td").eq(y��ǥ)
}

function �����¿����($this){
    var [x,y] = [$this.data("x"),$this.data("y")]
    var �����һ����ǥ = [
        [-1,-1], [-1,0], [-1,1], [0,-1], [0,1], [1,-1], [1,0], [1,1]
    ]

    �����һ����ǥ.forEach(function(�����ǥ){
        var [���x, ���y] = �����ǥ
        var $td = ����������(y + ���y,x + ���x);
        if( $td === null) return;
        openCell($td)
    })
}

function openCell($this){
    var ��źHTML = "<i class='fa fa-bomb'></i>"
    // data�� true, 0,1,2,3,4,~~ �������
    var data = $this.data("bombdata");

    if( $this.hasClass("active") ) return;
    $this.off("click")
    $this.addClass("active")

    
    if( data === true) $this.html(��źHTML)
     else {
        $this.html(data)
    }
    if( data === 0 ) �����¿����($this)


}

function initclickEvent(){
    var isTableVirgin = () => $("td.active").length === 0//???

    $(".gametable td").on("click",function(event){
        $this = $(this)
        var [x, y] = [$this.data("x"), $this.data("y")]
        if( isTableVirgin() ){
            installMine($this)
            //debugmode()
        }
        
        if( isClickedMine($this) )
            gameOver($this)
        else
            openCell($this)
         
    })

    /**
     * �ϰŵ�������/  ������Ŭ���ϸ�: ���
     * ���/ ����:Ŭ��X, ������Ŭ����: ����ǥ
     * ����ǥ/ ����:Ŭ����, ������Ŭ����: �����
     */
    $(".gametable td").on("contextmenu",function(event){
        $this = $(this)
        var ���HTML = "<i class='fab fa-font-awesome-flag'></i>"
        var ����ǥHTML = "<i class='fas fa-question'></i>"
        var flag = 0;
        event.preventDefault();
        if( $this.data( "isFlaged") !== true) {
            $this.data( "isFlaged", true )
        }
        else
            $this.html(����ǥHTML);
    })
}

function debugmode(){
    $("td").text(function(){
        return $(this).data("bombdata")
    })
}

/**
 * ���� ���� ��ư�� �������� ���̺��� �����մϴ�
 */
$(".start").on("click",function(){
    var $this = $(this);
    var { width, height, bomb } = getTableType($this)

    var $table = createTable(width,height,bomb)
    initclickEvent( $table )
   
})

