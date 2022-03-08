import { FacebookShareButton, TwitterShareButton } from "react-share";

export type color = string | CanvasGradient | CanvasPattern;

interface ChartProps {
    color: color,
    data: { [key: string]: number },
    your: number,
    padding: number,
    gridColor: color,
    gridScale: number,
    won: boolean
}

export function getCanvas(): HTMLCanvasElement {
    return document.getElementById("myCanvas") as HTMLCanvasElement;

}
function getCtx(): CanvasRenderingContext2D | null {
    const myCanvas = getCanvas();
    if (myCanvas != null) {
        myCanvas.width = 300;
        myCanvas.height = 300;
        return myCanvas.getContext("2d") as CanvasRenderingContext2D;
    }
    return null;
}

function drawLine(ctx: CanvasRenderingContext2D, startX: number, startY: number, endX: number, endY: number, color: color) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
    ctx.restore();
}

function drawBar(ctx: CanvasRenderingContext2D, label: string, font: number, upperLeftCornerX: number, upperLeftCornerY: number, width: number, height: number, color: color, lastHeight: number, nextHeight: number) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(upperLeftCornerX, upperLeftCornerY + height - lastHeight);
    ctx.lineTo(upperLeftCornerX, upperLeftCornerY);
    ctx.lineTo(width + upperLeftCornerX, upperLeftCornerY);
    ctx.lineTo(width + upperLeftCornerX, upperLeftCornerY + height - nextHeight);
    ctx.stroke();
    ctx.restore();
    ctx.save();
    ctx.translate(upperLeftCornerX + width / 2 - 3, upperLeftCornerY + height - 10);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(label, 0, font / 2);
    ctx.restore();
}

interface chartOptions {
    color: color,
    data: { [key: string]: number },
    padding: number,
    gridColor: color,
    gridScale: number,
    your: number
}


function draw(options: chartOptions) {
    const extraLeftPadding = 15;
    const ctx = getCtx();

    if (ctx != null && ctx != undefined) {
        let font = 20;
        ctx.font = font + 'px Arial, sans-serif';
        const canvas = getCanvas();
        const data = options.data;
        ctx.save();
        ctx.fillStyle = "#FFF";
        ctx.fillRect(0, 0, 300, 300);
        ctx.restore();
        if (ctx != null) {
            var maxValue = 0;
            for (var categ in options.data) {
                maxValue = Math.max(maxValue, options.data[categ]);
            }
            var canvasActualHeight = canvas.height - options.padding * 2;
            var canvasActualWidth = canvas.width - options.padding * 2;

            //drawing the grid lines
            var gridValue = 0;
            while (gridValue <= maxValue) {
                var gridY = canvasActualHeight * (1 - gridValue / maxValue) + options.padding;
                drawLine(
                    ctx,
                    0,
                    gridY,
                    canvas.width,
                    gridY,
                    options.gridColor
                );

                //writing grid markers
                ctx.save();
                ctx.fillStyle = options.gridColor;
                ctx.font = "bold 10px Arial";
                ctx.fillText(gridValue.toString(10), 10, gridY - 2);
                ctx.restore();

                gridValue += options.gridScale;
            }


            //drawing the bars
            var barIndex = 0;

            var numberOfBars = Object.keys(options.data).length;
            var barWidth = (canvasActualWidth - extraLeftPadding) / numberOfBars;
            var barHeights: number[] = [0].concat(Object.entries(data).map(([, a], b) => a).map((x) => Math.round(canvasActualHeight * x / maxValue))).concat([0]);
            for (categ in data) {
                drawBar(
                    ctx,
                    categ,
                    font,
                    options.padding + extraLeftPadding + 3 + barIndex * barWidth,
                    canvas.height - barHeights[barIndex + 1] - options.padding,
                    barWidth,
                    barHeights[barIndex + 1],
                    options.color,
                    barHeights[barIndex],
                    barHeights[barIndex + 2]
                );
                barIndex++;
            }

            //Draw "Your" line
            yourLine(ctx, font, options.your, canvasActualWidth, options.padding, extraLeftPadding);
        }
    }
}

function yourLine(ctx: CanvasRenderingContext2D, font: number, your: number, canvasActualWidth: number, padding: number, extraLeftPadding: number) {
    const x = xOfYour(your);
    drawLine(ctx, x, padding, x, 300 - padding - 3, "#11f")
    ctx.save();
    ctx.translate(Math.min(x - font / 2, 260), 5);
    ctx.fillStyle = "#11f"
    ctx.fillText("You", 0, font / 2);
    ctx.restore();
}

function xOfYour(your: number): number {
    return 294 - Math.min(2.22 * your, 280);
}

export function Chart(props: ChartProps) {
    if (props.won) {
        draw(
            {
                color: props.color,
                data: props.data,
                padding: props.padding,
                gridColor: props.gridColor,
                gridScale: props.gridScale,
                your: props.your
            }
        );
    }
    return (
        <canvas id="myCanvas"></canvas>
    );
}
