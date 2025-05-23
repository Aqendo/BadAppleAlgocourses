let _dom_loaded = false;
let _data = null;

document.addEventListener('DOMContentLoaded', function () {
    _dom_loaded = true;
    // buildStandings();
});

// (function() {
//     let xhr = new XMLHttpRequest();
//     xhr.open('GET', '/standings_data/' + standings_label, true);
//     xhr.responseType = 'json';
//     xhr.onload = function () {
//         let status = xhr.status;
//         if (status === 200) {
//             _data = xhr.response;
//             buildStandings();
//         } else {
//             loadFailed();
//         }
//     };
//     xhr.send();
// })();

var addCell = function(row, text, klass, rowSpan, colSpan) {
    let cell = row.insertCell();
    cell.innerHTML = text;
    cell.className = klass || '';
    cell.rowSpan = rowSpan || 1;
    cell.colSpan = colSpan || 1;
    return cell;
};

var loadFailed = function() {
    alert('Не удалось получить таблицу результатов!');
};

var compareUsers = function(a, b) {
    if (enable_marks) {
        if (a['mark'] !== b['mark']) {
            return b['mark'] - a['mark'];
        }
    }
    if (a['score'] !== b['score']) {
        return b['score'] - a['score'];
    }
    if (a['penalty'] !== b['penalty']) {
        return a['penalty'] - b['penalty'];
    }
    return a['name'].localeCompare(b['name']);
};

var getMarkColor = function(mark) {
    if (mark >= 7.5) {
        return 'lightgreen';
    } else if (mark >= 5.5) {
        return 'greenyellow';
    } else if (mark >= 3.5) {
        return 'yellow';
    } else {
        return 'lightcoral';
    }
};

var defaultContestMark = function(total_score, problem_score) {
    let problems = problem_score.length;
    let max_possible_score = problems;
    if (is_olymp) {
        max_possible_score *= 100;
    }
    return (problems !== 0 ? total_score / max_possible_score * 10 : 0.0);
};

var olympContestMark = function(total_score, problem_score, max_possible_score) {
    let problems = problem_score.length;
    return (problems !== 0 ? total_score / max_possible_score * 10 : 0.0);
}

var notOlympContestMark = function(total_score, problem_score) {
    let problems = problem_score.length;
    let max_possible_score = problems;
    return (problems !== 0 ? total_score / max_possible_score : 0.0);
};

var sqrtContestMark = function(total_score, problem_score) {
    let problems = problem_score.length;
    return (problems !== 0 ? Math.sqrt(total_score / problems) * 10 : 0.0);
};

var relativeContestMark = function(
    total_score,        // суммарный балл за контест
    problem_score,      // массив баллов за задачи
    problem_max_score,  // массив максимальных набранных баллов за задачи
    total_users,        // общее количество участников
    problem_accepted,   // массив количества ОК по задаче
    max_score           // максимальный набранный балл за контест
) {
    let problems = problem_score.length;
    if (max_score === 0) {
        return 0;
    } else {
        return total_score / max_score * 10;
    }
};

var useOldContestMark = function(total_scores, user_id) {
    let total_score = 0;
    let problem_score = new Array(total_scores[0].length).fill(0);
    let problem_max_score = new Array(total_scores[0].length).fill(0);
    let total_users = total_scores.length;
    let problem_accepted = new Array(problem_score.length).fill(0);
    let max_score = 0;
    for (let i = 0; i < total_users; i++) {
        let sc = 0;
        for (let j = 0; j < problem_score.length; j++) {
            problem_max_score[j] = Math.max(problem_max_score[j], total_scores[i][j]['score']);
            if (total_scores[i][j]['score'] > 0) {
                problem_accepted[j]++;
            }
            sc += total_scores[i][j]['score']
        }
        if (i === user_id) {
            for (let j = 0; j < problem_score.length; j++) {
                problem_score[j] = total_scores[i][j]['score']
            }
        }
        max_score = Math.max(max_score, sc);
        if (i === user_id) {
            total_score = sc;
        }
    }

    return calculateContestMark(
        total_score,
        problem_score,
        problem_max_score,
        total_users,
        problem_accepted,
        max_score,
    )
};

var defaultTotalMark = function(marks, coefficients) {
    let mean_mark = 0;
    let total_coef = 0;
    for (let i = 0; i < marks.length; i++) {
        let coef = 1.0;
        if (contest_id === -1) {
            coef = coefficients[i];
        }
        mean_mark += marks[i] * coef;
        total_coef += coef;
    }
    if (total_coef > 0) {
        mean_mark /= total_coef;
    }
    return mean_mark;
};

var blitzMark = function (problem_score, problem_accepted, total_users) {
    let mark = 0;
    for (let i = 0; i < problem_score.length; i++) {
        if (problem_score[i] > 0) {
            mark += total_users / (problem_score[i] * problem_accepted[i]);
        }
    }
    return mark
};

// возвращает единственное число -- оценку за контест
var calculateContestMark = function(
    total_score,        // суммарный балл за контест
    problem_score,      // массив баллов за задачи
    problem_max_score,  // массив максимальных набранных баллов за задачи
    total_users,        // общее количество участников
    problem_accepted,   // массив количества ОК по задаче
    max_score           // максимальный набранный балл за контест
) {
    return defaultContestMark(total_score, problem_score);
};

var calculateContestMark_ap22 = function(
    total_score,        // суммарный балл за контест
    problem_score,      // массив баллов за задачи
    problem_max_score,  // массив максимальных набранных баллов за задачи
    total_users,        // общее количество участников
    problem_accepted,   // массив количества ОК по задаче
    max_score           // максимальный набранный балл за контест
) {
    if (is_olymp) {
        return olympContestMark(total_score, problem_score, max_score);
    }
    else {
        return notOlympContestMark(total_score, problem_score);
    }
}

var newCalculateContestMark = function(
    total_scores,       // двумерный массив пар балла и времени сдачи задач пользователями
    user_id,            // номер пользователя
    contest_info        // информация о контесте
) {
    return useOldContestMark(total_scores, user_id)
};

var calculateTotalMark = function(
    marks,              // массив оценок за контесты
    coefficients,       // массив коэффициентов контестов
    total_score,        // суммарный балл за все контесты
    contest_score,      // массив баллов за контесты
    contest_max_score,  // массив максимальных набранных баллов за контесты
    problem_score,      // двумерный массив набранных баллов за задачи
    problem_max_score,  // двумерный массив максимальных набранных баллов за задач
    total_users,        // общее количество участников
    problem_accepted    // двумерный массив количества ОК по задаче
){
    return defaultTotalMark(marks, coefficients);
};

var calculateTotalMark_ap22 = function(
    marks,              // массив оценок за контесты
    coefficients,       // массив коэффициентов контестов
    total_score,        // суммарный балл за все контесты
    contest_score,      // массив баллов за контесты
    contest_max_score,  // массив максимальных набранных баллов за контесты
    problem_score,      // двумерный массив набранных баллов за задачи
    problem_max_score,  // двумерный массив максимальных набранных баллов за задач
    total_users,        // общее количество участников
    problem_accepted    // двумерный массив количества ОК по задаче
){
    if (is_olymp) {
        return defaultTotalMark(marks, coefficients);
    }
    else {
        return 10 * Math.sqrt(defaultTotalMark(marks, coefficients));
    }
};

var calculateMark = function(users, contests) {
    let problem_max_score = [];
    let problem_accepted = [];
    let coefficients = [];
    let total_scores = {};
    contests.forEach(function(contest, i) {
        total_scores[i] = [];
        problem_max_score.push([]);
        problem_accepted.push([]);
        coefficients.push(contest['coefficient']);
        contest['problems'].forEach(function(problem, j) {
            problem_max_score[i].push(0);
            problem_accepted[i].push(0);
        });
    });

    let user_total_score = {};
    let user_problem_score = {};
    users.forEach(function(user) {
        let id = user['id'];
        user_total_score[id] = 0;
        user_problem_score[id] = [];
        user['marks'] = [];
        user['scores'] = [];
        contests.forEach(function(contest, c_id) {
            let total_score = 0;
            user_problem_score[id].push([]);
            total_scores[c_id].push(contest['users'][id].slice(0));
            contest['users'][id].forEach(function(result, p_id) {
                let score = result['score'];
                let is_accepted = false;
                if (score > 0) {
                    is_accepted = true;
                }
                total_score += score;
                problem_max_score[c_id][p_id] = Math.max(problem_max_score[c_id][p_id], score);
                problem_accepted[c_id][p_id] += (+is_accepted);
                user_problem_score[id][c_id].push(score);
            });

            user['scores'].push(total_score);
            user_total_score[id] += total_score;
        });
    });

    users.forEach(function(user, u_id) {
        let id = user['id'];
        user['marks'] = [];
        contests.forEach(function(contest, c_id) {
            user['marks'].push(newCalculateContestMark(
                total_scores[c_id],
                u_id,
                contest["contest_info"]
            ));
        });
        user['mark'] = calculateTotalMark(
            user['marks'],
            coefficients,
            user_total_score[id],
            user_problem_score[id],
            problem_max_score,
            users.length,
            problem_accepted
        );
    });
};

var calculateInformation = function(users, contests) {
    users.forEach(function(user) {
        let id = user['id'];
        user['score'] = 0.0;
        user['penalty'] = 0;
        contests.forEach(function(contest) {
            contest['users'][id].forEach(function(result) {
                user['score'] += result['score'];
                if (result['score'] !== 0) {
                    user['penalty'] += result['penalty'];
                }
            });
        });
    });
};

var getScoreColor = function(score) {
    score = Math.min(score, 100);
    let red = parseInt(240 + (144 - 240) * Math.sqrt(score / 100));
    let green = parseInt(128 + (238 - 128) * Math.sqrt(score / 100));
    let blue = parseInt(128 + (144 - 128) * Math.sqrt(score / 100));
    return 'rgb(' + red + ',' + green + ',' + blue + ')';
};

var addProblemCell = function(row, problem) {
    let score = problem['score'];
    let penalty = problem['penalty'];
    if (is_olymp) {
        let text;
        if (score === 100) {
            text = '100';
        } else {
            if (score === 0 && penalty === 0) {
                text = '';
            } else {
                text = score;
            }
        }
        let cell = addCell(row, text, 'gray');
        if (text !== '') {
            cell.style.backgroundColor = getScoreColor(score);
        }
    } else if (is_blitz) {
        let bid = problem['bid'];
        let initial_bid = problem['initial_bid'];
        if (problem['verdict'] === 'OK') {
            addCell(row, bid, 'ok');
        } else if (problem['verdict'] === 'BP') {
            cell = addCell(row, bid, 'gray');
            cell.title = 'Ожидает посылки. Ставка: ' + initial_bid;
            cell.style.backgroundColor = '#ffdc33';
        } else if (problem['verdict'] === 'TE') {
            cell = addCell(row, bid, 'bad');
            cell.title = 'Время вышло. Cтавка: ' + initial_bid;
        } else {
            if (penalty === 0) {
                addCell(row, '', 'gray');
            } else {
                cell = addCell(row, bid, 'gray');
                cell.style.backgroundColor = '#f7943c';
                cell.title = '-' + penalty + '. Ставка: ' + initial_bid;
            }
        }
    } else {
        const add_inf = function (text) {
            return '<p class="small">' + text + '&infin;</p>';
        };
        if (problem['verdict'] === 'OK') {
            let text = '+';
            if (penalty > 0) {
                if (penalty <= 9) {
                    text += penalty;
                } else {
                    text = add_inf(text);
                }
            }
            let cell = addCell(row, text, 'ok');
            if (penalty > 9) {
                cell.title = '+' + penalty;
            }
        } else if (problem['verdict'] === 'RJ' || problem['verdict'] === 'IG') {
            let cell = addCell(row, 'D:', 'gray rotating');
            cell.title = 'Отклонено';
            cell.style.backgroundColor = '#f7943c';
        } else if (problem['verdict'] === 'PR') {
            let cell = addCell(row, '?', 'gray');
            cell.title = 'Ожидает подтверждения';
            cell.style.backgroundColor = '#ffdc33';
        } else if (problem['verdict'] === 'AC') {
            let cell = addCell(row, '?', 'gray');
            cell.title = 'Принято к проверке';
            cell.style.backgroundColor = '#fbe995';
        } else if (problem['verdict'] === 'SM') {
            let cell = addCell(row, '<div class="big_image"></div>', 'gray defense');
            cell.title = 'Призван на защиту';
        } else if (problem['verdict'] === 'SV') {
            let cell = addCell(row, '', "gray ban");
            cell.title = "Нарушены правила оформления"
        } else if (problem['verdict'] === 'DQ') {
            let cell = addCell(row, 'ᕁ_ᕁ', 'gray');
            cell.title = 'Дисквалифицированно';
            cell.style.backgroundColor = "#808080";
        } else {
            if (penalty === 0) {
                addCell(row, '', 'gray');
            } else {
                let text = '-';
                if (penalty <= 9) {
                    text += penalty;
                } else {
                    text = add_inf(text);
                }
                let cell = addCell(row, text, 'bad');
                if (penalty > 0) {
                    cell.title = '-' + penalty;
                }
            }
        }
    }
};

var addHeader = function(holder, contests) {
    let header_row1 = holder.insertRow();
    let header_row2 = holder.insertRow();
    addCell(header_row1, 'Место', '', 2, 1);
    addCell(header_row1, 'Гр.', '', 2, 1);
    addCell(header_row1, 'Фамилия и имя', '', 2, 1);
    addCell(header_row1, (is_olymp ? 'Балл' : 'Решено'), '', 2, 1);
    if (!is_olymp) {
        addCell(header_row1, 'Штраф', '', 2, 1);
    }
    if (enable_marks) {
        addCell(header_row1, 'Оценка', '', 2, 1);
    }

    if (contests.length === 0) {
        addCell(header_row1, '', 'invisible contest_title');
        addCell(header_row2, '', 'invisible');
    }

    contests.forEach(function(contest, idx) {
        let problems = contest['problems'];
        let coefficient = contest['coefficient'];
        let title_text = contest['title'];
        if (enable_marks) {
            title_text += ' (' + coefficient.toString() + ')';
        }
        let title;
        if (contest_id === -1) {
            title = '<a href="./' + (contests.length - 1 - idx) + '/">' + title_text + '</a>';
        } else {
            title = title_text;
        }
        addCell(header_row1, title, 'gray contest_title', 1, problems.length + 1);
        problems.forEach(function(problem) {
            let cell = addCell(header_row2, problem['short'], 'problem_letter gray');
            cell.title = problem['long'];
        });
        if (enable_marks && !is_olymp) {
            addCell(header_row2, 'Mark', 'problem_letter gray');
        }
        else {
            let cell = addCell(header_row2, 'Σ', 'problem_letter gray');
        }
    });
};

var fixColumnWidths = function (objs) {
    let results_pos = objs[0].childNodes[0].childNodes.length;
    objs[0].childNodes[0].childNodes.forEach(function (column, idx) {
        if (column.classList.contains('gray')) {
            results_pos = Math.min(results_pos, idx);
        }
    });
    let max_width = {};
    objs.forEach(function (obj) {
        obj.childNodes.forEach(function (row, row_idx) {
            let add = 0;
            if (row_idx === 1) {
               add = results_pos
            }
            let first = row_idx === 0;
            row.childNodes.forEach(function (column, idx) {
                if (first && idx >= results_pos) {
                    return;
                }
                let width = column.clientWidth;
                if ((idx + add) in max_width) {
                    max_width[idx + add] = Math.max(max_width[idx + add], width);
                } else {
                    max_width[idx + add] = width;
                }
            });
        })
    });
    objs.forEach(function(obj) {
        obj.childNodes.forEach(function(row, row_idx) {
            let add = 0;
            if (row_idx === 1) {
               add = results_pos
            }
            let first = row_idx === 0;
            row.childNodes.forEach(function (column, idx) {
                if (first && idx >= results_pos) {
                    return;
                }
                if (!column.classList.contains("invisible")) {
                    column.style.minWidth = max_width[idx + add] + 'px';
                }
            });
        });
    });
};

var addBody = function(body, users, contests) {
    for (let i = 0; i < users.length; i++) {
        let user = users[i];
        let id = user['id'];
        let row = body.insertRow();
        addCell(row, i + 1);
        addCell(row, user['group_short']);
        addCell(row, user['name'], 'name');
        addCell(row, user['score']);
        if (!is_olymp) {
            addCell(row, user['penalty']);
        }
        if (enable_marks) {
            let cell = addCell(row, user['mark'].toFixed(2));
            cell.style.backgroundColor = getMarkColor(user['mark']);
        }
        contests.forEach(function (contest, idx) {
            let problems = contest['users'][id];
            problems.forEach(function (problem) {
                addProblemCell(row, problem);
            });
            if (!is_olymp && enable_marks) {
                let cell = addCell(row, user['marks'][idx].toFixed(2));
                cell.style.backgroundColor = getMarkColor(user['marks'][idx]);
            }
            else {
                let text = user['scores'][idx];
                if (user['scores'][idx] === 0) {
                    text = ""
                }
                let cell = addCell(row, text, 'gray');
                if (is_olymp && user['scores'][idx] > 0) {
                    cell.style.backgroundColor = getScoreColor(user['scores'][idx] / problems.length);
                }
                else if (!is_olymp && user['scores'][idx] > 0) {
                    cell.style.backgroundColor = getMarkColor(10 * user['scores'][idx] / problems.length);
                }
            }
        });
    }
};

var preprocessData = function(data) {
    return data;
};

var buildStandings = function() {
    if (!_dom_loaded) {
        return;
    }
    if (!_data) {
        return;
    }
    let data = preprocessData(_data);
    let contests = data['contests'];
    if (contest_id !== -1) {
        if (contest_id < 0 || contest_id >= contests.length) {
            alert('Wrong contest id!');
        }
        contests = [contests[contests.length - 1 - contest_id]];
        data['contests'] = contests;
    }

    let users = data['users'];
    calculateInformation(users, contests);
    calculateMark(users, contests);
    users.sort(compareUsers);
    users = users.filter(user => (user['score'] > 0) || (user['penalty'] !== undefined && user['penalty'] > 0) || is_blitz);

    let table = document.getElementById('standings');
    let header = document.createElement('thead');
    let body = document.createElement('tbody');
    table.appendChild(header);
    table.appendChild(body);
    let table_fixed = document.getElementById('standings_fixed');
    let body_fixed = document.createElement('tbody');
    table_fixed.appendChild(body_fixed);
    addHeader(header, contests);
    addHeader(body, contests);
    addBody(body, users, contests);
    addHeader(body_fixed, []);
    addBody(body_fixed, users, []);
    fixColumnWidths([header, body_fixed, body], contests);

    document.getElementsByClassName('wrapper')[0].addEventListener('scroll', function(e) {
        header.style.marginLeft = -e.target.scrollLeft + 'px';
    });

    let rotating_elements = document.getElementsByClassName("rotating");
    for (let i = 0; i < rotating_elements.length; i++) {
        let el = rotating_elements[i];
        let ang = 0;
        setInterval(function() {
            ang += 1;
            ang %= 360;
            el.style.transform = "rotate(-" + ang + "deg)";
        }, 10);
    }
};
