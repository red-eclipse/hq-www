// Helpers
Number.prototype.zeropad = function(len) {
    var s = String(this), c = '0';
    len = len || 2;
    while(s.length < len) s = c + s;
    return s;
}

Element.prototype.remove = function() {
    this.parentElement.removeChild(this);
}

NodeList.prototype.remove = HTMLCollection.prototype.remove = function() {
    for(var i = this.length - 1; i >= 0; i--) {
        if(this[i] && this[i].parentElement) {
            this[i].parentElement.removeChild(this[i]);
        }
    }
}

Element.prototype.makechild = function(elemname, idname, classname) {
    var child = document.createElement(elemname);
    child.id = idname;
    child.className = classname;
    this.appendChild(child);
    return child;
}

Array.prototype.extend = function (data) {
    data.forEach(function(v) {
        this.push(v)
    }, this);    
}

function makecookie(name, value, exdays) {
    var exdate = new Date();
    exdate.setDate(exdate.getDate() + exdays);
    document.cookie = name + '=' + escape(value) + '; expires=' + exdate.toUTCString() + '; path=/';
}

function strncmp(a, b, n){
    return a.substring(0, n) == b.substring(0, n);
}

function makedate(offset, date) {
    var d = null, o = offset || 0;
    if(date) d = new Date(date);
    else d = new Date();
    if(o) d.setTime(d.getTime() + (24 * 60 * 60 * 1000 * o));
    return d.getFullYear() + '-' + (d.getMonth() + 1).zeropad() + '-' + d.getDate().zeropad();
}

String.prototype.capital = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

// Exist Sense

var exist = {
    attrs: [ 'group', 'label', 'priority' ],
    items: [ 'attribute', 'label', 'priority', 'private', 'service', 'value', 'value_type', 'value_type_description' ],
    access: {},
    cookies: {},
    data: {},
    makepage: function(date, range) {
        var data = {
            date: date || null,
            range: range || 28,
        }
        return data;
    },
    info: {
        nologin: false,
        printview: false,
        ready: false,
        page: {
            date: makedate(),
            range: 28,
        },
    },
    fa: function(type, colour, size, margin) {
        var value = '<span class="exist-fa ' + (type ? type : 'fas fa-cog fa-spin') + ' fa-fw" style="margin: ' + (margin ? margin : '0px 0px 0px 0px') + ';';
        if(colour) value += 'color: ' + colour + ';';
        if(size && size > 0) {
            value += '-webkit-filter: drop-shadow(-1px -1px ' + size + 'px ' + colour + ');';
            value += 'filter: drop-shadow(-1px -1px ' + size + 'px ' + colour + ');';
        }
        value += '"></span>';
        return value;
    },
    status: function(title, type) {
        var load = document.getElementById('exist-status');
        if(load) {
            if(title && title != '') {
                load.innerHTML = exist.fa(type, '#FFCCCC', 0) + ' ' + title;
                load.visibility = 'visible';
            }
            else {
                load.innerHTML = '';
                load.visibility = 'hidden';
            }
        }
    },
    auth: function() {
        window.location = 'https://exist.io/oauth2/authorize?response_type=code&client_id=124d5b5764184a4d81c2&redirect_uri=https%3A%2F%2Fhq.redeclipse.net%2Fexist%2F&scope=read+write';
    },
    switch: function() {
        makecookie('exist', '', 0);
        exist.auth();
    },
    login: {
        error: function(request, statname, errname) {
            exist.status('Authorisation ' + statname + ': ' + errname + ' ' + request.responseJSON.error, 'fas fa-exclamation-circle');
        },
        refresh: function(request, statname, errname) {
            exist.status('Refresh ' + statname + ': ' +  errname + ' ' + request.responseJSON.error, 'fas fa-exclamation-circle');
            exist.auth();
        },
        success: function(data, statname, request) {
            exist.status('Logged in!', 'fas fa-check-circle');
            var top = document.getElementById('exist-login');
            if(top) {
                top.href = '#';
                top.title = 'Waiting for user information..';
                top.onclick = '';
            }
            exist.access = data;
            makecookie('exist', exist.access.refresh_token, exist.access.expires_in / 60 / 60 / 24);
            exist.cookies.exist = exist.access.refresh_token;
            exist.request.start('today', 'GET', 'users/$self/today', {}, exist.today);
        },
        start: function(type, name, access_code, success_callback, error_callback) {
            var pname = name.replace('_', ' ');
            exist.status('Logging in with ' + pname + '..');
            var reqdata = {
                method: 'POST',
                url: 'https://hq.redeclipse.net/exist/oauth/access_token',
                data: {
                    grant_type: type,
                    client_id: '124d5b5764184a4d81c2',
                    client_secret: 'c2fa36b0daa451bb6fd5a89ee5856eaadf17b2aa',
                    redirect_uri: window.location.href
                },
                success: function(data, statname, request) {
                    console.log(type + ':', statname, request, data);
                    if(success_callback) success_callback(data, statname, request);
                },
                error: function(request, statname, errname) {
                    console.log(type + ':', statname, errname, request);
                    if(error_callback) error_callback(request, statname, errname);
                }
            }
            reqdata.data[name] = access_code;
            console.log(type + ': start', access_code, reqdata);
            $.ajax(reqdata);
        },
    },
    request: {
        error: function(request, statname, errname, name) {
            exist.status('Loading ' + name + ' returned ' + statname + ': ' + errname, 'fas fa-exclamation-circle');
        },
        start: function(name, method, uri, data, success_callback, error_callback) {
            exist.status('Requesting data for ' + name + '..');
            var reqdata = {
                method: method,
                url: 'https://hq.redeclipse.net/exist/api/1/' + uri + '/',
                data: data,
                headers: {
                    Authorization: exist.access.token_type + ' '  + exist.access.access_token
                },
                success: function(data, statname, request) {
                    console.log('request (' + name + '):', statname, request, data);
                    if(success_callback) success_callback(data, statname, request);
                },
                error: function(request, statname, errname) {
                    console.log('request (' + name + '):', statname, errname, request);
                    if(error_callback) error_callback(request, statname, errname, name);
                    else exist.error(request, statname, errname, name)
                }
            }
            console.log('request (' + name + '): start', uri, reqdata);
            $.ajax(reqdata);
        },
    },
    load: function(data, attributes) {
        for(var i = 0; i < data.length; i++) {
            var attr = data[i], group = attr['group'];
            if(group.name) group = group.name;
            if(exist.data[group] == null) exist.data[group] = {};
            if(attributes) {
                if(group == 'custom' && attr.attribute != 'custom') {
                    var values = attr.attribute.split('_'), name = values[0], slug = values[1],
                        pint = parseInt(values[1]), grp = null, label = null, isnum = false, start = 1;
                    if(values[1] == pint) {
                        slug = name;
                        name = slug == 'cycle' ? 'mood' : 'health';
                        isnum = true;
                        start = 2;
                    }
                    for(var n = start; n < values.length; n++) {
                        if(grp == null) grp = values[n];
                        else grp += '_' + values[n];
                        if(label == null) label = values[n].capital();
                        else label += ' ' + values[n];
                    }
                    if(!isnum && grp) slug = grp;
                    if(exist.data[name] == null) {
                        exist.data[name] = {
                            group: name,
                            label: name.capital(),
                            priority: attr.priority
                        };
                    }
                    if(exist.data[name][slug] == null) exist.data[name][slug] = { values: {} };
                    if(exist.data[name][slug]['values'] == null) exist.data[name][slug]['values'] = {};
                    for(var j = 0; j < attr.values.length; j++) {
                        var item = attr.values[j];
                        if(item.value || !isnum) {
                            if(exist.data[name][slug]['values'][item.date] == null) exist.data[name][slug]['values'][item.date] = {};
                            if(values.length >= 2) {
                                exist.data[name][slug]['values'][item.date]['value'] = isnum ? pint : item.value;
                                if(isnum) {
                                    if(exist.data[name][slug]['minval'] == null || exist.data[name][slug]['minval'] > pint)
                                        exist.data[name][slug]['minval'] = pint;
                                    if(exist.data[name][slug]['maxval'] == null || exist.data[name][slug]['maxval'] < pint)
                                        exist.data[name][slug]['maxval'] = pint;
                                }
                                if(grp) {
                                    var desc = isnum ? values[1] : slug;
                                    if(exist.data[name][slug]['values'][item.date]['group'] == null)
                                        exist.data[name][slug]['values'][item.date]['group'] = grp;
                                    if(exist.data[name][slug]['values'][item.date]['label'] == null)
                                        exist.data[name][slug]['values'][item.date]['label'] = label;
                                    if(exist.data[name][slug]['desc'] == null) exist.data[name][slug]['desc'] = {};
                                    if(exist.data[name][slug]['desc'][desc] == null) {
                                        exist.data[name][slug][slug]['desc'][desc] = {
                                            group: grp,
                                            label: label
                                        };
                                    }
                                }
                            }
                            else exist.data[name][slug]['values'][item.date] = { value: item.value };
                        }
                    }
                }
                else {
                    if(exist.data[group][attr.attribute] == null) exist.data[group][attr.attribute] = {};
                    if(exist.data[group][attr.attribute]['values'] == null) exist.data[group][attr.attribute]['values'] = {};
                    for(var j = 0; j < attr.values.length; j++) {
                        var item = attr.values[j];
                        exist.data[group][attr.attribute]['values'][item.date] = { value: item.value };
                        if(exist.data[group][attr.attribute]['value_type'] <= 1) {
                            var val = item.value ? item.value : (item.value_type ? 0.0 : 0);
                            if(exist.data[group][attr.attribute]['minval'] == null || exist.data[group][attr.attribute]['minval'] > val)
                                exist.data[group][attr.attribute]['minval'] = val;
                            if(exist.data[group][attr.attribute]['maxval'] == null || exist.data[group][attr.attribute]['maxval'] < val)
                                exist.data[group][attr.attribute]['maxval'] = val;
                        }
                    }
                }
            }
            else {
                for(var j = 0; j < exist.attrs.length; j++) {
                    exist.data[group][exist.attrs[j]] = attr[exist.attrs[j]];
                }
                for(var j = 0; j < attr.items.length; j++) {
                    var item = attr.items[j];
                    if(exist.data[group][item.attribute] == null) exist.data[group][item.attribute] = {};
                    for(var k = 0; k < exist.items.length; k++) {
                        var ex = exist.items[k];
                        exist.data[group][item.attribute][ex] = item[ex];
                    }
                    if(item.value_type <= 1) {
                        if(exist.data[group][item.attribute]['minval'] == null || exist.data[group][item.attribute]['minval'] > item.value)
                            exist.data[group][item.attribute]['minval'] = item.value;
                        if(exist.data[group][item.attribute]['maxval'] == null || exist.data[group][item.attribute]['maxval'] < item.value)
                            exist.data[group][item.attribute]['maxval'] = item.value;
                    }
                }
                if(group == 'custom') {
                    for(var j = 0; j < attr.items.length; j++) {
                        var item = attr.items[j];
                        if(item.attribute != 'custom') {
                            var values = item.attribute.split('_'), name = values[0], string = item.label.split(' ');
                            if(values.length >= 2) {
                                var pint = parseInt(values[1]), slug = values[1], grp = null, label = null, isnum = false, start = 1;
                                if(values[1] == pint) {
                                    slug = name;
                                    name = slug == 'cycle' ? 'mood' : 'health';
                                    isnum = true;
                                    start = 2;
                                }
                                for(var n = start; n < values.length; n++) {
                                    if(grp == null) grp = values[n];
                                    else grp += '_' + values[n];
                                    if(label == null) label = values[n].capital();
                                    else label += ' ' + values[n];
                                }
                                if(!isnum && grp) slug = grp;
                                if(exist.data[name] == null) {
                                    exist.data[name] = {
                                        group: name,
                                        label: name.capital(),
                                        priority: item.priority
                                    };
                                }
                                if(exist.data[name][slug] == null) exist.data[name][slug] = {};
                                for(var k = 0; k < exist.items.length; k++) {
                                    var ex = exist.items[k];
                                    if(ex == 'attribute') exist.data[name][slug][ex] = slug;
                                    else if(ex == 'label') exist.data[name][slug][ex] = slug == 'pef' ? 'Peak Expiratory Flow' : (isnum ? slug.capital() : label);
                                    else if(ex == 'value' && isnum)
                                    {
                                        if(exist.data[name][slug]['minval'] == null || exist.data[name][slug]['minval'] > pint)
                                            exist.data[name][slug]['minval'] = pint;
                                        if(exist.data[name][slug]['maxval'] == null || exist.data[name][slug]['maxval'] < pint)
                                            exist.data[name][slug]['maxval'] = pint;
                                        if(item.value) exist.data[name][slug][ex] = pint;
                                    }
                                    else if(ex == 'value_type' && !isnum) exist.data[name][slug][ex] = 'String';
                                    else exist.data[name][slug][ex] = item[ex];
                                }
                                if(grp) {
                                    var desc = isnum ? values[1] : slug;
                                    if(exist.data[name][slug]['desc'] == null) exist.data[name][slug]['desc'] = {};
                                    exist.data[name][slug]['desc'][desc] = {
                                        group: grp,
                                        label: label
                                    };
                                }
                            }
                            else {
                                if(exist.data[name] == null) {
                                    exist.data[name] = {
                                        group: name,
                                        label: name.capital(),
                                        priority: item.priority
                                    };
                                }
                                if(exist.data[name][name] == null) exist.data[name][name] = {};
                                for(var k = 0; k < exist.items.length; k++) {
                                    var ex = exist.items[k];
                                    exist.data[name][name][ex] = item[ex];
                                }
                                if(item.value_type <= 1) {
                                    var val = item.value ? item.value : (item.value_type ? 0.0 : 0);
                                    if(exist.data[name][name]['minval'] == null || exist.data[name][name]['minval'] > val)
                                        exist.data[name][name]['minval'] = val;
                                    if(exist.data[name][name]['maxval'] == null || exist.data[name][name]['maxval'] < val)
                                        exist.data[name][name]['maxval'] = val;
                                }
                            }
                        }
                    }
                }
            }
        }
        if(exist.data.mood.mood) {
            exist.data.mood.mood.minval = 0;
            exist.data.mood.mood.maxval = 5;
        }
    },
    value: function(data, date, type) {
        if(date) {
            if(data.values[date]) return data.values[date][type ? type : 'value'];
            else return null;
        }
        else return data.value;
    },
    display: function(indate, inlen) {
        var hbody = document.getElementById('exist-header'), date = indate ? makedate(0, indate) : makedate(), today = makedate(), len = inlen || 28;
        if(hbody) {
            hbody.innerHTML = '';
            var hrow = hbody.makechild('tr', 'exist-data-row', 'exist-left'),
                head = hrow.makechild('td', 'exist-data-info', 'exist-left'),
                span = head.makechild('span', 'exist-data-info', 'exist-left');
            span.makechild('h4', 'exist-data-info-welcome', 'exist-left').innerHTML = 'Welcome ' + exist.info.first_name + ', here is your data for ' + (date != today ? date : 'today');
            if(exist.value(exist.data.weather.weather_summary, date)) {
                var weather = exist.data.weather, par = span.makechild('p', 'exist-data-info-weather', 'exist-left');
                if(exist.value(weather.weather_icon, date))
                    par.innerHTML += ' <img src="https://exist.io/static/img/weather/' + exist.value(weather.weather_icon, date) + '.png" title="' + exist.value(weather.weather_summary, date) + '" class="exist-icon" />';
                else par.innerHTML += ' ' + exist.fa('fas fa-sun', '#FFFF00', 4, '0px 4px 0px 0px');
                if(exist.value(weather.weather_summary, date))
                    par.innerHTML += ' <i>' + exist.value(weather.weather_summary, date) + '</i>';
                if(exist.value(weather.weather_temp_min, date))
                    par.innerHTML += ' ' + weather.weather_temp_min.label + ' of <b>' + exist.value(weather.weather_temp_min, date) + '&deg;C</b>.';
                if(exist.value(weather.weather_temp_max, date))
                    par.innerHTML += ' ' + weather.weather_temp_max.label + ' of <b>' + exist.value(weather.weather_temp_max, date) + '&deg;C</b>.';
            }
            if(exist.value(exist.data.activity.steps, date)) {
                var activity = exist.data.activity, par = span.makechild('p', 'exist-data-info-activity', 'exist-left');
                par.innerHTML = exist.fa('fas fa-street-view', '#00FF00', 4, '0px 4px 0px 0px');
                if(exist.value(activity.steps, date)) par.innerHTML += ' <b>' + exist.value(activity.steps, date) + '</b> ' + activity.steps.label.toLowerCase() + '.';
                if(exist.value(activity.steps_active_min, date)) par.innerHTML += ' <b>' + exist.value(activity.steps_active_min, date) + '</b> ' + activity.steps_active_min.label.toLowerCase() + '.';
                if(exist.value(activity.steps_distance, date)) par.innerHTML += ' <b>' + exist.value(activity.steps_distance, date) + '</b> ' + activity.steps_distance.label.toLowerCase() + '.';
            }
            if(exist.value(exist.data.sleep.sleep, date)) {
                var sleep = exist.data.sleep, par = span.makechild('p', 'exist-data-info-sleep', 'exist-left');
                par.innerHTML = exist.fa('fas fa-bed', '#FF00FF', 4, '0px 4px 0px 0px');
                if(exist.value(sleep.sleep, date)) par.innerHTML += ' <b>' + exist.value(sleep.sleep, date) + 'm</b> ' + sleep.sleep.label.toLowerCase() + '.';
                if(exist.value(sleep.time_in_bed, date)) par.innerHTML += ' <b>' + exist.value(sleep.time_in_bed, date) + 'm</b> ' + sleep.time_in_bed.label.toLowerCase() + '.';
                if(exist.value(sleep.sleep_awakenings, date)) par.innerHTML += ' <b>' + exist.value(sleep.sleep_awakenings, date) + '</b> ' + sleep.sleep_awakenings.label.toLowerCase() + '.';
            }
            if(exist.data.health) {
                var health = exist.data.health, par = span.makechild('p', 'exist-data-info-health', 'exist-left');
                par.innerHTML = exist.fa('fas fa-heart', '#FF0000', 4, '0px 4px 0px 0px');
                if(exist.value(health.weight, date)) {
                    par.innerHTML += ' ' + health.weight.label + ': <b>' + exist.value(health.weight, date) + '</b> kg.';
                    if(health.weight.service == 'googlefit') par.innerHTML += ' (<a href="https://fit.google.com" target="_blank">Google Fit</a>)';
                }
                if(exist.value(health.pef, date))
                    par.innerHTML += ' ' + health.pef.label + ': <b>' + exist.value(health.pef, date) + '</b> L/min.';
            }
            if(exist.data.mood) {
                var mood = exist.data.mood, par = span.makechild('p', 'exist-data-info-mood', 'exist-left');
                par.innerHTML = exist.fa('fas fa-question-circle', '#00FFFF', 4, '0px 4px 0px 0px');
                if(exist.value(mood.mood, date)) par.innerHTML += ' ' + mood.mood.label + ': <b>' + exist.value(mood.mood, date) + '</b>/' + mood.mood.maxval + '.';
                else par.innerHTML += ' ' + mood.mood.label + ': <i>Not Rated.</i>';
                if(exist.value(mood.mood_note, date)) par.innerHTML += ' Notes: <i>' + exist.value(mood.mood_note, date) + '</i>.';
                if(mood.cycle) {
                    var cycle = mood.cycle;
                    par.innerHTML += ' ' + cycle.label + ':';
                    if(exist.value(cycle, date)) par.innerHTML += ' <b>' + exist.value(cycle, date) + '</b>/' + cycle.maxval + ' (' + exist.value(cycle, date, 'label')  + ').';
                    else par.innerHTML += ' <i>Not Rated.</i>';
                }
                if(mood.mood.service == 'exist_for_android') par.innerHTML += ' (<a href="https://exist.io/mood/timeline/edit/' + date +  '/" target="_blank">Exist</a>)';
            }
        }
        exist.chart.start(date, len);
    },
    attributes: function(data, statname, request) {
        exist.status('Loading attributes..');
        exist.load(data, true);
        console.log('user:', exist);
        exist.status('Ready.', 'fas fa-check-circle');
        exist.info.ready = true;
        var date = makedate(), len = 28;
        if(exist.info.page.range) len = exist.info.page.range;
        if(exist.info.page.date) date = exist.info.page.date;
        else if(!exist.value(exist.data.weather.weather_summary, date)) date = makedate(-1);
        exist.display(date, len);
    },
    today: function(data, statname, request) {
        exist.status('Loading today..');
        jQuery.each(data, function(i, val) {
            if(i != 'attributes') exist.info[i] = val;
        });
        exist.load(data.attributes, false);
        var top = document.getElementById('exist-login');
        if(top) {
            top.innerHTML = '<img src="' + exist.info.avatar + '" />';
            top.href = 'https://exist.io/';
            top.title = 'Logged in as: ' + exist.info.username + ' (#' + exist.info.id + ')';
            top.onclick = '';
        }
        exist.request.start('attributes', 'GET', 'users/$self/attributes', {}, exist.attributes);
    },
    chart: {
        list: [],
        lastdate: makedate(),
        lastlen: 28,
        resetwait: false,
        getcolour: function(name) {
            return window.getComputedStyle(document.getElementById('exist-table'), null).getPropertyValue(name);
        },
        defaults: function() {
            var bgcol = exist.chart.getcolour('background-color'), fgcol = exist.chart.getcolour('color'), brcol = '#555555'; //exist.chart.getcolour('border-color');
            Chart.defaults.global.responsive = true;
            Chart.defaults.global.responsiveAnimationDuration = 1000;
            Chart.defaults.global.maintainAspectRatio = true;
            Chart.defaults.global.defaultColor = fgcol;
            Chart.defaults.global.defaultFontColor = fgcol;
            Chart.defaults.global.defaultFontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"';
            Chart.defaults.global.defaultFontSize = 12;
            Chart.defaults.global.defaultFontStyle = 'bold';
            Chart.defaults.global.showLines = true;
            Chart.defaults.global.elements.arc.backgroundColor = bgcol;
            Chart.defaults.global.elements.arc.borderColor = brcol;
            Chart.defaults.global.elements.arc.borderWidth = 2;
            Chart.defaults.global.elements.line.tension = 0.4;
            Chart.defaults.global.elements.line.backgroundColor = bgcol;
            Chart.defaults.global.elements.line.borderWidth = 2;
            Chart.defaults.global.elements.line.borderColor = brcol;
            Chart.defaults.global.elements.line.borderCapStyle = 'round';
            Chart.defaults.global.elements.line.borderDashOffset = 0;
            Chart.defaults.global.elements.line.borderJoinStyle = 'miter';
            Chart.defaults.global.elements.line.capBezierPoints = true;
            Chart.defaults.global.elements.line.fill = false;
            Chart.defaults.global.elements.point.radius = 3;
            Chart.defaults.global.elements.point.pointStyle = 'circle';
            Chart.defaults.global.elements.point.backgroundColor = bgcol;
            Chart.defaults.global.elements.point.borderColor = brcol;
            Chart.defaults.global.elements.point.borderWidth = 1;
            Chart.defaults.global.elements.point.hitRadius = 1;
            Chart.defaults.global.elements.point.hoverRadius = 4;
            Chart.defaults.global.elements.point.hoverBorderWidth = 2;
            Chart.defaults.global.elements.rectangle.backgroundColor = bgcol;
            Chart.defaults.global.elements.rectangle.borderColor = brcol;
            Chart.defaults.global.elements.rectangle.borderSkipped = 'bottom';
            Chart.defaults.global.elements.rectangle.borderWidth = 0;
            Chart.defaults.global.layout.padding.top = 10;
            Chart.defaults.global.layout.padding.right = 10;
            Chart.defaults.global.layout.padding.bottom = 10;
            Chart.defaults.global.layout.padding.left = 10;
            Chart.defaults.global.animation.duration = 1000;
            Chart.defaults.global.animation.easing = 'easeOutQuart';
            Chart.defaults.global.tooltips.enabled = true;
            Chart.defaults.global.tooltips.mode = 'nearest';
            Chart.defaults.global.tooltips.position = 'average';
            Chart.defaults.global.tooltips.intersect = true;
            Chart.defaults.global.tooltips.backgroundColor = '#000000';
            Chart.defaults.global.tooltips.titleFontStyle = 'bold';
            Chart.defaults.global.tooltips.titleSpacing = 0;
            Chart.defaults.global.tooltips.titleMarginBottom = 2;
            Chart.defaults.global.tooltips.titleFontColor = '#FFFFFF';
            Chart.defaults.global.tooltips.titleAlign = 'left';
            Chart.defaults.global.tooltips.bodySpacing = 2;
            Chart.defaults.global.tooltips.bodyFontColor = '#FFFFFF';
            Chart.defaults.global.tooltips.bodyAlign = 'left';
            Chart.defaults.global.tooltips.footerFontStyle = 'normal';
            Chart.defaults.global.tooltips.footerSpacing = 8;
            Chart.defaults.global.tooltips.footerMarginTop = 0;
            Chart.defaults.global.tooltips.footerFontColor = '#FFFFFF';
            Chart.defaults.global.tooltips.footerAlign = 'left';
            Chart.defaults.global.tooltips.yPadding = 6;
            Chart.defaults.global.tooltips.xPadding = 6;
            Chart.defaults.global.tooltips.caretPadding = 4;
            Chart.defaults.global.tooltips.caretSize = 6;
            Chart.defaults.global.tooltips.cornerRadius = 4;
            Chart.defaults.global.tooltips.multiKeyBackground = '#000000';
            Chart.defaults.global.tooltips.displayColors = false;
            Chart.defaults.global.tooltips.borderColor = '#FFFFFF';
            Chart.defaults.global.tooltips.borderWidth = 1;
            Chart.defaults.global.legend.display = true;
            Chart.defaults.global.legend.position = 'top';
            Chart.defaults.global.legend.fullWidth = true;
            Chart.defaults.global.legend.reverse = false;
            Chart.defaults.global.legend.weight = 1000;
            Chart.defaults.global.legend.labels.boxWidth = 40;
            Chart.defaults.global.legend.labels.padding = 10;
            Chart.defaults.global.title.display = false;
            Chart.defaults.global.title.fontStyle = 'bold';
            Chart.defaults.global.title.fullWidth = true;
            Chart.defaults.global.title.lineHeight = 1.2;
            Chart.defaults.global.title.padding = 10;
            Chart.defaults.global.title.position = 'top';
            Chart.defaults.global.title.weight = 2000;
        },
        dataset: function(name, colour) {
            var data = {
                label: name,
                data: [],
                spanGaps: true,
                fontColor: colour,
                backgroundColor: colour,
                borderColor: colour,
                pointBorderColor: colour
            };
            return data;
        },
        scale: function(min, max, display, label, offset) {
            var data = {
                display: display || false,
                position: 'left',
                offset: true,
                gridLines: {
                    display: display || false,
                    color: '#333333',
                    lineWidth: 1,
                    drawBorder: display || false,
                    drawOnChartArea: display || false,
                    drawTicks: display || false,
                    tickMarkLength: 10,
                    zeroLineWidth: 0,
                    zeroLineColor: '#333333',
                    zeroLineBorderDash: [],
                    zeroLineBorderDashOffset: 0,
                    offsetGridLines: false,
                    borderDash: [],
                    borderDashOffset: 0
                },
                scaleLabel: {
                    display: label ? true : false,
                    labelString: label,
                    lineHeight: 1.2,
                    padding: {
                        top: 4,
                        bottom: 4
                    }
                },
                ticks: {
                    minRotation: 0,
                    maxRotation: 90,
                    suggestedMin: min,
                    suggestedMax: max,
                    mirror: false,
                    padding: 0,
                    reverse: false,
                    display: display || false,
                    autoSkip: true,
                    autoSkipPadding: 0,
                    labelOffset: offset || 0
                }
            };
            return data;
        },
        data: function(id, type, name) {
            var data = {
                id: id,
                type: type,
                label: name,
                values: [],
                data: {
                    labels: [],
                    datasets: []
                },
                options: {
                    responsive: true,
                    layout: {
                        padding: {
                            left: 0,
                            right: 0,
                            top: 8,
                            bottom: 0
                        }
                    },
                    scales: {
                        yAxes: [],
                        xAxes: []
                    }
                }
            }
            return data;
        },
        create: function(name, type, desc, min, max, values, names, colours) {
            var data = exist.chart.data('exist-chart-' + name, type, desc);
            data.options.scales.xAxes[0] = exist.chart.scale(null, null, true);
            for(var i in names) data.data.datasets[i] = exist.chart.dataset(names[i], colours[i]);
            for(var i in values) {
                data.options.scales.yAxes[i] = exist.chart.scale(min, max, i == 0 ? true : false, desc);
                data.values[i] = values[i];
            }
            return data;
        },
        display: function(head, indate, inlen) {
            var date = indate ? indate : makedate(), len = inlen || 28, charts = [], count = 0,
                width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth,
                h1 = width > 1280 ? 100 : 150, h2 = width > 1280 ? 75 : 150;
            if(exist.data.health.pef) {
                head.innerHTML += '<canvas id="exist-chart-pef" class="exist-chart" width="400px" height="' + h1 + 'px"></canvas>';
                charts[count] = exist.chart.create(
                    'pef', 'line', 'L/min', 400, 450,
                    [exist.data.health.pef.values],
                    ['Peak Expiratory Flow (L/Min)'],
                    [exist.info.printview ? '#000000' : '#FFFFFF']
                );
                count++;
            }
            if(exist.data.mood.mood) {
                head.innerHTML += '<canvas id="exist-chart-mood" class="exist-chart" width="400px" height="' + h2 + 'px"></canvas>';
                var values = [exist.data.mood.mood.values], names = ['Mood'], colours = [exist.info.printview ? '#9900DD' : '#CC33FF'], moods = 0;
                moods++;
                if(exist.data.mood.cycle) {
                    values[moods] = exist.data.mood.cycle.values;
                    names[moods] = 'Cycle';
                    colours[moods] = exist.info.printview ? '#DD7700' : '#FFCC33';
                    moods++;
                }
                charts[count] = exist.chart.create('mood', 'line', 'Out of 5', 0, 5, values, names, colours);
                count++;
            }
            if(exist.data.health.pain) {
                head.innerHTML += '<canvas id="exist-chart-pain" class="exist-chart" width="400px" height="' + h2 + 'px"></canvas>';
                charts[count] = exist.chart.create(
                    'pain', 'line', 'Out of 5', 0, 5,
                    [exist.data.health.pain.values],
                    ['Pain'],
                    [exist.info.printview ? '#0077AA' : '#33CCFF']
                );
                count++;
            }
            if(exist.data.weather.weather_temp_min || exist.data.weather.weather_temp_max) {
                head.innerHTML += '<canvas id="exist-chart-temp" class="exist-chart" width="400px" height="' + h1 + 'px"></canvas>';
                charts[count] = exist.chart.create(
                    'temp', 'line', 'Temperature (°C)', exist.data.weather.weather_temp_min.value, exist.data.weather.weather_temp_max.value,
                    [exist.data.weather.weather_temp_min.values, exist.data.weather.weather_temp_max.values],
                    ['Min Temp', 'Max Temp'],
                    [exist.info.printview ? '#2222AA' : '#8888FF', exist.info.printview ? '#AA2200' : '#FF8800']
                );
                count++;
            }
            if(exist.data.activity.steps) {
                head.innerHTML += '<canvas id="exist-chart-steps" class="exist-chart" width="400px" height="' + h1 + 'px"></canvas>';
                charts[count] = exist.chart.create(
                    'steps', 'line', 'Steps', 0, 1,
                    [exist.data.activity.steps.values],
                    ['Steps'],
                    [exist.info.printview ? '#00AA22' : '#33FF88']
                );
                count++;
            }

            for(var n = 0; n < len; n++) {
                var ndate = makedate(n - (len - 1), date);
                for(var m = 0; m < charts.length; m++) {
                    charts[m].data.labels[n] = ndate.split('-')[2];
                    for(var q = 0; q < charts[m].values.length; q++) {
                        charts[m].data.datasets[q].data[n] = charts[m].values[q][ndate] ? charts[m].values[q][ndate].value : null;
                    }
                }
            }
            
            exist.chart.list = [];
            for(var i = 0; i < charts.length; i++) {
                var elem = document.getElementById(charts[i].id);
                if(elem) exist.chart.list[i] = new Chart(elem.getContext('2d'), charts[i]);
                else console.log('chart not found', charts[i].id, elem);
            }
        },
        start: function(date, len) {
            exist.chart.resetwait = false;
            var hbody = document.getElementById('exist-body');
            if(hbody) {
                hbody.innerHTML = '';
                if(date) {
                    exist.chart.lastdate = date;
                    if(date == 'today') exist.chart.lastdate = makedate();
                    else if(date == 'yesterday') exist.chart.lastdate = makedate(-1);
                    else if(date == 'tomorrow') exist.chart.lastdate = makedate(1);
                    if(!exist.value(exist.data.mood.mood, exist.chart.lastdate)) {
                        for(var i = 1; i < 7; i++) {
                            exist.chart.lastdate = makedate(-1, exist.chart.lastdate);
                            if(exist.value(exist.data.mood.mood, exist.chart.lastdate)) break;
                        }
                    }
                }
                if(len) exist.chart.lastlen = len;
                var hrow = hbody.makechild('tr', 'exist-chart-row', 'exist-left'),
                    head = hrow.makechild('td', 'exist-chart-info', 'exist-left');
                head.innerHTML = '<h4 id="exist-chart-pre" class="exist-left">Last ' + exist.chart.lastlen + ' Days</h4>';
                exist.chart.display(head, exist.chart.lastdate, exist.chart.lastlen);
            }
        },
        reset: function() {
            if(!exist.chart.resetwait) {
                exist.chart.resetwait = true;
                for (var i in Chart.instances) Chart.instances[i].destroy();
                Chart.instances = {};
                window.setTimeout(exist.chart.start, 500);
            }
        }
    },
    checkurl: function(values) {
        var url = window.location.href, hash = url.split('#'), params = hash[0].split('?'), value = params[0], count = 0;
        if(params.length >= 2) {
            var code = params[1].split('&');
            for(var i = 0; i < code.length; i++) {
                var item = code[i].split('=');
                if(item[0] == 'code') {
                    exist.info.nologin = true;
                    exist.login.start('authorization_code', 'code', item[1], exist.login.success, exist.login.error);
                }
                else if(item[0] != 'state') {
                    if(item[0] == 'print' && item[1] != '0') exist.info.printview = true;
                    if(!count) value += '?';
                    else value += '&';
                    value += item[0] + '=' + item[1];
                    count++;
                }
            }
        }
        if(values || (hash.length >= 2 && hash[1] != '')) {
            if(hash.length >= 2 && hash[1] != '') {
                var code = hash[1].split('&'), oldpage = exist.info.page, num = 0;
                exist.info.page = exist.makepage();
                for(var i = 0; i < code.length; i++) {
                    var item = code[i].split('=');
                    exist.info.page[item[0]] = item[1];
                    if(oldpage[item[0]] != item[1]) num++;
                }
                for(var i in oldpage) if(oldpage[i] != exist.info.page[i]) num++;
            }
            if(values) {
                for(var i in values) {
                    exist.info.page[i] = values[i];
                    num++;
                }
            }
            var opts = hash[0] + '#', vars = 0;
            for(var i in exist.info.page) {
                console.log(vars, i, exist.info.page[i]);
                if(exist.info.page[i]) {
                    if(vars != 0) opts += '&';
                    opts += i + '=' + exist.info.page[i];
                    vars++;
                }
            }
            if(num) {
                window.history.replaceState({}, document.title, opts);
                if(exist.info.ready) exist.display(exist.info.page.date, exist.info.page.range);
            }
        }
        else {
            window.history.replaceState({}, document.title, value);
            if(exist.info.ready) exist.display(makedate(), 28);
        }
    },
    start: function() {
        exist.cookies = {};
        var cookies = decodeURIComponent(document.cookie).split(';');
        if(cookies.length > 0) {
            for(var i = 0; i < cookies.length; i++) {
                var cookie = cookies[i];
                while(cookie.charAt(0) == ' ') cookie = cookie.substring(1);
                var value = cookie.split('=');
                if(value.length >= 2) exist.cookies[value[0]] = value[1];
            }
            console.log('cookies:', exist.cookies);
        }
        exist.checkurl();
        exist.chart.defaults();
        if(exist.info.nologin == false) {
            if(exist.cookies.exist != null) {
                exist.login.start('refresh_token', 'refresh_token', exist.cookies.exist, exist.login.success, exist.login.refresh);
            }
            else {
                var hbody = document.getElementById('exist-header');
                if(hbody) {
                    hbody.innerHTML = '';
                    var hrow = hbody.makechild('tr', 'exist-data-row', 'exist-left'),
                        head = hrow.makechild('td', 'exist-data-info', 'exist-left'),
                        span = head.makechild('span', 'exist-data-info', 'exist-left');
                        span.innerHTML = '<p>Exist Sense helps you make sense of your custom tag values.</p>';
                        span.innerHTML += '<p>Please <b><a class="exist-left" href="#" onclick="exist.auth();">Login with Exist.io</a></b> to continue.</p>';
                }
                exist.status('Login to continue.', 'fas fa-user');
            }
        }
        else {
            exist.status('Logging in..');
        }
    }
};

$(document).ready(function ($) {
    jQuery('time.timeago').timeago();
    jQuery.timeago.settings = {
        refreshMillis: 60000,
        allowPast: true,
        allowFuture: true,
        localeTitle: false,
        cutoff: 0,
        autoDispose: true,
        strings: {
            prefixAgo: null,
            prefixFromNow: null,
            suffixAgo: 'ago',
            suffixFromNow: 'from now',
            inPast: 'any moment',
            seconds: 'a moment',
            minute: '1 minute',
            minutes: '%d minutes',
            hour: '1 hour',
            hours: '%d hours',
            day: '1 day',
            days: '%d days',
            month: '1 month',
            months: '%d months',
            year: '1 year',
            years: '%d years',
            wordSeparator: ' ',
            numbers: []
        }
    }
    exist.start();
});

$(window).on('hashchange', function() {
    exist.checkurl();
});
$(window).resize(function() {
    exist.chart.reset();
});