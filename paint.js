var Paint = {
    init: function() {
        this.painting = false;
        this.canvas = $('canvas');
        this.context = this.canvas[0].getContext("2d");
        this.size = 1;
        this.history = [];
        this.historyIdx = -1;

        // canvas events
        this.canvas.mousedown(this.mousedown.bind(this));
        this.canvas.mousemove(this.mousemove.bind(this));
        this.canvas.mouseup(this.mouseupleave.bind(this));
        this.canvas.mouseleave(this.mouseupleave.bind(this));

        this.prepColors();
    },
    prepColors: function() {
        var colors = [
            'rgb(0, 0, 0)', 'rgb(255, 255, 255)', 'rgb(80, 80, 80)', 'rgb(179, 179, 179)',
            'rgb(255, 0, 0)', 'rgb(255, 118, 0)', 'rgb(255, 235, 0)', 'rgb(157, 255, 0)',
            'rgb(63, 255, 0)', 'rgb(0, 220, 255)', 'rgb(0, 55, 255)', 'rgb(39, 0, 255)',
            'rgb(133, 0, 255)', 'rgb(97, 4, 183)', 'rgb(239, 0, 255)', 'rgb(255, 0, 141)'
        ]
        colors.forEach(function(color, i) {
            $('<div/>', {
                class: 'color',
                style: 'background-color: ' + color + ';',
                click: function() {
                    this.setColor(color);
                }.bind(this)
            }).appendTo('.colors');
        }.bind(this));
        // set default color
        this.setColor(colors[0]);
    },
    draw: function(x, y) {
        this.action.push([x, y]);
        this.context.beginPath();
        this.context.moveTo(this.mouseX, this.mouseY);
        this.context.lineTo(x, y);
        this.mouseX = x;
        this.mouseY = y;
        this.context.strokeStyle = this.color;
        this.context.lineWidth = this.size;
        this.context.stroke();
        this.context.closePath();
    },
    undo: function() {
        if (this.historyIdx >= 0) {
            this.historyIdx--;
            this.redraw();
            this.recalcButtons();
        }
    },
    redo: function() {
        if (this.historyIdx < this.history.length-1) {
            this.historyIdx++;
            this.redraw();
            this.recalcButtons();
        }
    },
    redraw: function() {
        this.context.clearRect(0, 0, this.canvas[0].width, this.canvas[0].height);
        var history = this.history.slice(0, this.historyIdx+1);

        history.forEach( function(action) {
            this.setColor(action.color);
            this.size = action.size;

            var steps = action.coordinates;
            this.mouseX = steps[0][0];
            this.mouseY = steps[0][1];

            steps.forEach(function(step) {
                this.draw(step[0], step[1]);
            }.bind(this));

        }.bind(this));
        this.action = [];
    },
    mousedown: function(e) {
        this.mouseX = e.offsetX;
        this.mouseY = e.offsetY;
        this.action = [];

        this.painting = true;
        this.draw(this.mouseX, this.mouseY);
    },
    mousemove: function(e) {
        if (this.painting) {
            this.draw(e.offsetX, e.offsetY);
        }
    },
    mouseupleave: function(e) {
        if (this.painting) {
            this.addToHistory();
        }
        this.painting = false;
    },
    addToHistory: function() {
        this.history = this.history.slice(0, this.historyIdx+1);
        this.history.push({
            color: this.color,
            size: this.size,
            coordinates: this.action
        });
        this.historyIdx = this.history.length - 1;
        this.action = [];
        this.recalcButtons();
    },
    setColor: function(color) {
        this.color = color;
        $('.color').removeClass('selected');
        $('.color').each( function(i, el) {
            if ($(el).css('background-color') == color) {
                $(el).addClass('selected');
            }
        });
    },
    recalcButtons: function() {
        if (this.historyIdx == this.history.length-1) {
            $('.redo').addClass('disabled');
        } else {
            $('.redo').removeClass('disabled');
        }
        if (this.historyIdx == -1) {
            $('.undo').addClass('disabled');
        } else {
            $('.undo').removeClass('disabled');
        }
        $('.brush-button').removeClass('selected');
        $('[data-size="' + this.size + '"]').addClass('selected');
    },
    setSize: function(el) {
        this.size = parseInt(el.data('size'));
        $('.brush-button').removeClass('selected');
        el.addClass('selected');
    }
}

$(document).ready(function() {
    Paint.init();
    $('.undo').click(function() {
        Paint.undo();
    });
    $('.redo').click(function() {
        Paint.redo();
    });
    $('.brush-button').click(function() {
        Paint.setSize($(this));
    });
});
