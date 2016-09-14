//Define globals
var $particles = new Array();
var $startNodes = new Array();
var $isPaused = false;
var $canvas = document.getElementById('bg-canvas');
var $context = $canvas.getContext('2d');
$canvas.width = 300;
$canvas.height = 300;

var $canvasLeft = 0;
var $canvasTop = 0;
var $canvasRight = $canvas.width;
var $canvasBottom = $canvas.height;

var $canvasCx = $canvas.width / 2;
var $canvasCy = $canvas.height / 2;
var $maxBoltJump = 1200;

window.onblur = function() {
    $isPaused = true;
}
window.onfocus = function() {
	if($isPaused === true) {
		moveParticles();
	}
    $isPaused = false;
}

window.requestAnimFrame = (function(callback)
{
	return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
	function(callback)
	{
		window.setTimeout(callback, 1000 / 60);
	};
})();

function drawCenter()
{
	$context.beginPath();
	$context.arc(150, 150, 10, 0, 2 * Math.PI, false);
	$context.lineWidth = 1;
	$context.strokeStyle = '#48d819';
	$context.stroke();
	$context.fillStyle = 'rgba(255,255,255,0.2)';
	$context.fill();
}

function drawOuter()
{
	$context.beginPath();
	$context.arc(150, 150, 150, 0, 2 * Math.PI, false);
	$context.lineWidth = 1;
	$context.strokeStyle = '#48d819';
	$context.stroke();	
}
      
function drawParticle(star)
{
	$context.beginPath();
	$context.arc(star.x, star.y, 1, 0, 2 * Math.PI, false);
	$context.fillStyle = 'rgba(0,0,0,0)';
	$context.fill();
}

function drawStartNode($startNode)
{
	$context.beginPath();
	$context.arc($startNode.x, $startNode.y, 1, 0, 2 * Math.PI, false);
	$context.fillStyle = '#ffffff';
	$context.fill();	
}

function moveParticles()
{
	$context.fillStyle = '#000000';
	$context.fillRect(0, 0, $canvas.width, $canvas.height);

	moveStartNodes();
	drawOuter();
	drawCenter();
	drawPlasma();

	for(var key in $particles) {
		var $p = $particles[key];
		$p.x += $p.vx;
		$p.y += $p.vy;
		
			
		var $a, $b;

		if($p.x > 150) {
			$a = $p.x - 150;
		} else if ($p.x < 150) {
			$a = 150 - $p.x;
		} else {
			$a = 0;
		}

		if($p.y > 150) {
			$b = $p.y - 150;
		} else if ($p.y < 150) {
			$b = 150 - $p.y;
		} else {
			$b = 0;
		}

		var c = Math.sqrt($a*$a + $b*$b);
		
		if(c > 150) {
			$p.vx *= -1;
			$p.vy *= -1;
		}

		if(c < 10) {
			$p.vx *= -1;
			$p.vy *= -1;
		}
		
		//For detecting collisions acurately
		//r1 is inner circle
		//r1>r2+d
		
		drawParticle($p);
	}

	requestAnimFrame(function() {
	if(!$isPaused) {
		moveParticles();
	}
});
}

function moveStartNodes()
{
	for(var key in $startNodes)
	{
		var $n = $startNodes[key];

		$n.x = 150 + Math.cos($n.angle) * 10;
		$n.y = 150 + Math.sin($n.angle) * 10;
		$n.angle += $n.spin
		$n.spin += Math.random() * 0.01 - 0.005;
		if($n.spin > 0.1) {
			$n.spin = 0.1;
		}
		if($n.spin < -0.1) {
			$n.spin = -0.1;
		}

		drawStartNode($n);
	}
}

function GetDistFromContent($p)
{
	var $ret = 0;		
	var $a, $b;

	if($p.x > 150) {
		$a = $p.x - 150;
	} else if ($p.x < 150) {
		$a = 150 - $p.x;
	} else {
		$a = 0;
	}

	if($p.y > 150) {
		$b = $p.y - 150;
	} else if ($p.y < 150) {
		$b = 150 - $p.y;
	} else {
		$b = 0;
	}

	$ret = Math.sqrt($a*$a + $b*$b);

	return $ret;
}

function drawBolt($n)
{
	var $dx;
	var $dy;
	var $dist;

	var $lowestParticleDist = 0;
	var $edgeDist = 0;
	var $curEdgeDist = 0;
	var $lastEdgeDist = 0;
	var $bFoundNode = false;
	var $iNextNodeIndex = 0;
	var $px = $n.x;
	var $py = $n.y;
	var $oldPx = $px;
	var $oldPy = $py;
	//var $normalizedDist = 0;

	while (true) {
		$lowestParticleDist = 100000;
		$bFoundNode = false;

		for(i = 0; i < $particles.length; i++) {
			var $p = $particles[i];
			
			$dx = $p.x - $px;
			$dy = $p.y - $py;
			
			
			var $a, $b;

			if($p.x > $px) {
				$a = $p.x - $px;
			} else if ($p.x < $px) {
				$a = $px - $p.x;
			} else {
				$a = 0;
			}

			if($p.y > $py) {
				$b = $p.y - $py;
			} else if ($p.y < $py) {
				$b = $py - $p.y;
			} else {
				$b = 0;
			}
			
			$dist = $a*$a+$b*$b;

			//If the particle is closer than the last particle we found we want to see if we can use it
			if($dist < $lowestParticleDist) {
				$curEdgeDist = GetDistFromContent($p);
				
				//Make sure the bolt doesn't go backwards
				if($curEdgeDist <= $lastEdgeDist )
					continue;
				//Make sure we don't use a particle that's outside the plasma ball.
				//Particle shouldn't get outside of the ball anyway
				if($curEdgeDist > 150)
					continue;
				if($dist > $maxBoltJump )
					continue;
				//Set to the distance of the center circle squared
				if($dist <= 98)
					continue;

				if($curEdgeDist < 15) {
					var $intersect = checkIfLineIntersectsCenter($px, $py, $p.x, $p.y, 150, 150, 10);
					
					if($intersect === true) {
						continue;
					}
				}

				$lowestParticleDist = $dist;
				$edgeDist = $curEdgeDist;
				$iNextNodeIndex = i;
				$bFoundNode = true;
			}
		}

		if($bFoundNode == false) {
			break;
		}

		$px = $particles[$iNextNodeIndex].x;
		$py = $particles[$iNextNodeIndex].y;
		$lastEdgeDist = $edgeDist;

		var $xc = ($oldPx + $px) / 2;
		var $yc = ($oldPy + $py) / 2;
		$context.quadraticCurveTo($oldPx, $oldPy, $xc, $yc);

		$oldPx = $px;
		$oldPy = $py;
	}
}

function drawPlasma()
{
	$context.beginPath();
	var $gradient = $context.createRadialGradient(150, 150, 50, 150, 150, 150);
	$gradient.addColorStop("0","#48d819");
	$gradient.addColorStop("1","#f2f22a");
	$context.strokeStyle = $gradient;
	$context.lineWidth = 2;
	$context.shadowColor = "#48d819"
	$context.shadowBlur = 40;
	$context.shadowOffsetX = 0;
	$context.shadowOffsetY = 0;

	for(var key in $startNodes) {
		var $n = $startNodes[key];
		$context.moveTo($n.x, $n.y);

		drawBolt($n);
	}

	$context.stroke();
	$context.closePath();
}

function initParticles()
{
	var $speed = 0.6;

	for (i = 0; i < 350; i++) {
		var $angle = Math.random() * 2 * Math.PI;

		var $p = {};

		do {
			$p.x = Math.random() * $canvas.width;
			$p.y = Math.random() * $canvas.height;
			
			var $a, $b;
			
			if($p.x > 150) {
				$a = $p.x - 150;
			} else if ($p.x < 150) {
				$a = 150 - $p.x;
			} else {
				$a = 0;
			}
			
			if($p.y > 150) {
				$b = $p.y - 150;
			} else if ($p.y < 150) {
				$b = 150 - $p.y;
			} else {
				$b = 0;
			}

			var c = Math.sqrt( $a*$a + $b*$b );
		} while ( c > 150 || c < 10);

		$p.vx = Math.cos($angle) * $speed;
		$p.vy = Math.sin($angle) * $speed;

		$particles.push($p);
	}
}

function initStartNodes()
{
	var $speed = (Math.random() * 1) - 0.5;

	for (i = 0; i < 10; i++) {
		var $n = {};
		$n.x = 140;
		$n.y = 150;
		$n.vx = Math.random() * $speed;
		$n.vy = Math.random() * $speed;
		
		$n.angle = 0;
		$n.spin = 0;
		
		$startNodes.push($n);
	}
}

function initPlasmaBall()
{
	initParticles();
	initStartNodes();
	moveParticles();
}

initPlasmaBall();

function checkIfLineIntersectsCenter(aX, aY, bX, bY, cX, cY, R)
{
	dX = bX - aX;
	dY = bY - aY;
	if((dX == 0) && (dY == 0)) {
		return false;
	}

	dl = (dX * dX + dY * dY);
	t = ((cX - aX) * dX + (cY - aY) * dY) / dl;

	nearestX = aX + t * dX;
	nearestY = aY + t * dY;

	dist = pointToCenterDistance(nearestX, nearestY, cX, cY);

	if(dist == R) {
		return true;
	} else if (dist < R) {
		return true;
	} else {
		return false;
	}
}

function pointToCenterDistance($x1, $y1, $cx, $cy)
{
	var $xs = $cx - $x1;
	var $ys = $cy - $y1;
	return Math.sqrt($xs*$xs + $ys*$ys);
}