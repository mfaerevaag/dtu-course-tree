#!/usr/bin/node

var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var _ = require('lodash');
var argv = require('minimist')(process.argv.slice(2));

var courses = '1';
var base_url = 'http://www.kurser.dtu.dk/';

if (argv['all']) {
    courses += ',10,IHK,83,11,12,13,23,24,25,26,27,28,30,31,33,34,41,42,46,47,48,59';
}

var courses_url = 'http://www.kurser.dtu.dk/search.aspx?txtSearchKeyword=%20&lstDepartment=' + courses + '&lstTeachingPeriod=&YearGroup=2013-2014&btnSearch=Search&menulanguage=en-GB';

request(courses_url, function (err, res, html) {
    if (!err) {
        var $ = cheerio.load(html);

        var urls = _.chain($('a'))
            .filter(function(o) {
                return $(o).attr('href').match(/[0-9]+\.aspx/);
            })
            .reduce(function (acc, o) {
                return acc + base_url + $(o).attr('href') + '\n';
            }, '')
            .value();

        process.stdout.write(urls);
    }
});
