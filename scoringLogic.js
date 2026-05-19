const axios = require('axios');
const keywordData = require('./risk_keywords.json');
const XLSX = require('xlsx');
const path = require('path');
const {cloudinaryUpload}=require('./util/cloudinary')
const fs = require('fs');
const API_KEY = '49174427b558d2af53e538f950d775f5';
const BASE_URL = 'https://api.social-searcher.com/v2/search';
const { saveToAirtable } = require('./airtable');
const peopledatalabs = require('@api/peopledatalabs');
const RetentionData = require('./retentiondata');
const PreHireRetentionData = require('./prehireretentiondata');

const filemodel = require('./filemodel');

let enrichedData = [
{ email: "lyndsi.foster10@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: "facebook.com/lyndsi.foster.7", facebook_username: "lyndsi.foster.7", twitter_url: null, twitter_username: null, pdl_match_confidence: 75 },
{ email: "hillarypleake@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 27 },
{ email: "dlstarks2@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 94 },
{ email: "atwyford26@outlook.com", linkedin_url: "linkedin.com/in/annie-twyford-856032228", linkedin_username: "annie-twyford-856032228", facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 19 },
{ email: "whichardelijah@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: "facebook.com/uriah.fortner", facebook_username: "uriah.fortner", twitter_url: null, twitter_username: null, pdl_match_confidence: 35 },
{ email: "twalker0009@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 94 },
{ email: "Mewalden59@Gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 9 },
{ email: "skycold23@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: "facebook.com/joseff.gistekki", facebook_username: "joseff.gistekki", twitter_url: null, twitter_username: null, pdl_match_confidence: 26 },
{ email: "sdarryl528@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 94 },
{ email: "msmrkl13@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 12 },
{ email: "kaydenseyer857@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: "facebook.com/chris.caudill.3990", facebook_username: "chris.caudill.3990", twitter_url: null, twitter_username: null, pdl_match_confidence: 41 },
{ email: "bscroughams@yahoo.com", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 27 },
{ email: "caleb.rund@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 98 },
{ email: "countryjosh135@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: "facebook.com/josh.myers.54379236", facebook_username: "josh.myers.54379236", twitter_url: null, twitter_username: null, pdl_match_confidence: 95 },
{ email: "cmalet043@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: "facebook.com/chris.malet.9", facebook_username: "chris.malet.9", twitter_url: null, twitter_username: null, pdl_match_confidence: 12 },
{ email: "lauderzachary18@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: "facebook.com/bert.acton.90", facebook_username: "bert.acton.90", twitter_url: null, twitter_username: null, pdl_match_confidence: 39 },
{ email: "amanda.kay.krutz@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 30 },
{ email: "aaronjones12349@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 93 },
{ email: "loganj87@comcast.net", linkedin_url: null, linkedin_username: null, facebook_url: "facebook.com/logan.johnson.777", facebook_username: "logan.johnson.777", twitter_url: null, twitter_username: null, pdl_match_confidence: 92 },
{ email: "roberthuesman24@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 5 },
{ email: "bgardner450@icloud.com", linkedin_url: "linkedin.com/in/brian-gardner-131465b", linkedin_username: "brian-gardner-131465b", facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 95 },
{ email: "dot3318@yahoo.com", linkedin_url: null, linkedin_username: null, facebook_url: "facebook.com/daniel.dotson.75", facebook_username: "daniel.dotson.75", twitter_url: null, twitter_username: null, pdl_match_confidence: 95 },
{ email: "cmbut10643@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 43 },
{ email: "dbboyd1523@yahoo.com", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 79 },
{ email: "cterry9388@hotmail.com", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 46 },
{ email: "elizabethholloman98@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 37 },
{ email: "ccoker@hancockhealth.org", linkedin_url: "linkedin.com/in/carmen-coker-12527063", linkedin_username: "carmen-coker-12527063", facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 19 },
{ email: "GABBYSTRADA1791@GMAIL.COM", linkedin_url: "linkedin.com/in/gabriela-estrada-2a1146202", linkedin_username: "gabriela-estrada-2a1146202", facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 99 },
{ email: "cstone51819@yahoo.com", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 65 },
{ email: "lindsey.robinson93@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 75 },
{ email: "gehall0926@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 45 },
{ email: "jkhoopingarner@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: "facebook.com/jujubee0406", facebook_username: "jujubee0406", twitter_url: null, twitter_username: null, pdl_match_confidence: 98 },
{ email: "marij0930@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 93 },
{ email: "makayla.shirkey@yahoo.com", linkedin_url: "linkedin.com/in/makayla-shirkey-1b7814207", linkedin_username: "makayla-shirkey-1b7814207", facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 16 },
{ email: "lilianapstanford@gmail.com", linkedin_url: "linkedin.com/in/liliana-stanford", linkedin_username: "liliana-stanford", facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 17 },
{ email: "oliviastuckey@yahoo.com", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 45 },
{ email: "NTucker@hancockhealth.org", linkedin_url: "linkedin.com/in/noelle-blanford-10425554", linkedin_username: "noelle-blanford-10425554", facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 74 },
{ email: "agstout@hotmail.com", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 99 },
{ email: "levi_marie@ymail.com", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 99 },
{ email: "spk42013@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: "facebook.com/sethpaulkelly", facebook_username: "sethpaulkelly", twitter_url: null, twitter_username: null, pdl_match_confidence: 96 },
{ email: "ladychristina2424@gmail.com", linkedin_url: "linkedin.com/in/mike-mucha-674b3bb2", linkedin_username: "mike-mucha-674b3bb2", facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 11 },
{ email: "bobi_brancamp@hotmail.com", linkedin_url: null, linkedin_username: null, facebook_url: "facebook.com/bobi.a.cross", facebook_username: "bobi.a.cross", twitter_url: null, twitter_username: null, pdl_match_confidence: 99 },
{ email: "amosdarian6@gmail.com", linkedin_url: "linkedin.com/in/darian-amos-26b130148", linkedin_username: "darian-amos-26b130148", facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 15 },
{ email: "madeline.cregar@att.net", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 27 },
{ email: "Sharocity1@gmail.com", linkedin_url: "linkedin.com/in/shari-debord-96726556", linkedin_username: "shari-debord-96726556", facebook_url: null, facebook_username: null, twitter_url: "twitter.com/sharidebord", twitter_username: "sharidebord", pdl_match_confidence: 16 },
{ email: "tieraalashay317@gmail.com", linkedin_url: "linkedin.com/in/tiera-florence-60ab991b3", linkedin_username: "tiera-florence-60ab991b3", facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 22 },
{ email: "bhagen@butler.edu", linkedin_url: "linkedin.com/in/annabella-hagen-200454290", linkedin_username: "annabella-hagen-200454290", facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 90 },
{ email: "tshakenn21@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: "facebook.com/jeremy.sams.562", facebook_username: "jeremy.sams.562", twitter_url: null, twitter_username: null, pdl_match_confidence: 42 },
{ email: "colelauterbach08@gmail.com", linkedin_url: "linkedin.com/in/colemanedwards", linkedin_username: "colemanedwards", facebook_url: "facebook.com/cole.lauterbach", facebook_username: "cole.lauterbach", twitter_url: null, twitter_username: null, pdl_match_confidence: 8 },
{ email: "irishginny@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 99 },
{ email: "madim08@icloud.com", linkedin_url: "linkedin.com/in/madison-muirhead-4077ba1b6", linkedin_username: "madison-muirhead-4077ba1b6", facebook_url: "facebook.com/madison.muirhead", facebook_username: "madison.muirhead", twitter_url: null, twitter_username: null, pdl_match_confidence: 13 },
{ email: "salauadeife@gmail.com", linkedin_url: "linkedin.com/in/adesalau-0bb8a8262", linkedin_username: "adesalau-0bb8a8262", facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 22 },
{ email: "katiesar12@gmail.com", linkedin_url: "linkedin.com/in/katie-tyrrel-443491119", linkedin_username: "katie-tyrrel-443491119", facebook_url: "facebook.com/katie.tyrrel", facebook_username: "katie.tyrrel", twitter_url: null, twitter_username: null, pdl_match_confidence: 10 },
{ email: "nrtroxell@yahoo.com", linkedin_url: null, linkedin_username: null, facebook_url: "facebook.com/nicole.troxell.5", facebook_username: "nicole.troxell.5", twitter_url: null, twitter_username: null, pdl_match_confidence: 94 },
{ email: "cwilk346@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: "facebook.com/elaine.wilkerson.3", facebook_username: "elaine.wilkerson.3", twitter_url: null, twitter_username: null, pdl_match_confidence: 76 },
{ email: "gyoung0@ftstudent.org", linkedin_url: "linkedin.com/in/katie-stephenson-a7972078", linkedin_username: "katie-stephenson-a7972078", facebook_url: "facebook.com/katie.stephenson.737", facebook_username: "katie.stephenson.737", twitter_url: null, twitter_username: null, pdl_match_confidence: 34 },
{ email: "blairkitch@gmail.com", linkedin_url: "linkedin.com/in/blairkitch", linkedin_username: "blairkitch", facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 11 },
{ email: "asmith8136@yahooo.com", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 47 },
{ email: "JWright2@hancockhealth.org", linkedin_url: "linkedin.com/in/jaici-wright-33615b263", linkedin_username: "jaici-wright-33615b263", facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 22 },
{ email: "david.ham73@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 99 },
{ email: "KYoung7@hancockhealth.org", linkedin_url: null, linkedin_username: null, facebook_url: "facebook.com/kami.hastingsyoung", facebook_username: "kami.hastingsyoung", twitter_url: null, twitter_username: null, pdl_match_confidence: 97 },
{ email: "jennamw06@gmail.com", linkedin_url: "linkedin.com/in/jenna-whiteside-0125798b", linkedin_username: "jenna-whiteside-0125798b", facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 9 },
{ email: "cdwaits3@gmail.com", linkedin_url: "linkedin.com/in/claire-waits-a80b3095", linkedin_username: "claire-waits-a80b3095", facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 16 },
{ email: "lainey.sutton828@gmail.com", linkedin_url: "linkedin.com/in/terri-paul-1735b430", linkedin_username: "terri-paul-1735b430", facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 43 },
{ email: "mackenzie.spurlin02@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 27 },
{ email: "asmithsa12@rossmedical.com", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 51 },
{ email: "drssiler@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 97 },
{ email: "kquigley713@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: "facebook.com/ktorres137", facebook_username: "ktorres137", twitter_url: null, twitter_username: null, pdl_match_confidence: 48 },
{ email: "sheritapendergrass@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: "facebook.com/sherita.pendergrass.1", facebook_username: "sherita.pendergrass.1", twitter_url: null, twitter_username: null, pdl_match_confidence: 99 },
{ email: "itskennedygrace2@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: "facebook.com/kennedy.owens.758", facebook_username: "kennedy.owens.758", twitter_url: null, twitter_username: null, pdl_match_confidence: 97 },
{ email: "emilyoleksy33@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 19 },
{ email: "hannahportwood4@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 72 },
{ email: "kambimundy@yahoo.com", linkedin_url: "linkedin.com/in/kambi-zanè-mundy-24275316a", linkedin_username: "kambi-zanè-mundy-24275316a", facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 13 },
{ email: "mcdanielz2002@gmail.com", linkedin_url: "linkedin.com/in/mike-birochak-6507649", linkedin_username: "mike-birochak-6507649", facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 39 },
{ email: "ajlewman5@gmail.com", linkedin_url: "linkedin.com/in/alexis-lewman-232789313", linkedin_username: "alexis-lewman-232789313", facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 19 },
{ email: "kleimankj@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 42 },
{ email: "chassidycline14@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 77 },
{ email: "butlersamaria2034@yahoo.com", linkedin_url: null, linkedin_username: null, facebook_url: "facebook.com/samaria.bulter.5", facebook_username: "samaria.bulter.5", twitter_url: null, twitter_username: null, pdl_match_confidence: 74 },
{ email: "cailiburk17@yahoo.com", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 60 },
{ email: "latreskesha@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 19 },
{ email: "rbish6986@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: "facebook.com/ricole.bish", facebook_username: "ricole.bish", twitter_url: null, twitter_username: null, pdl_match_confidence: 99 },
{ email: "catk10538@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: "facebook.com/roger.griffith.1829", facebook_username: "roger.griffith.1829", twitter_url: null, twitter_username: null, pdl_match_confidence: 47 },
{ email: "anthonybecksr@hotmail.com", linkedin_url: "linkedin.com/in/anthony-beck-sr-31337049", linkedin_username: "anthony-beck-sr-31337049", facebook_url: "facebook.com/anthonybecksr", facebook_username: "anthonybecksr", twitter_url: "twitter.com/absministries", twitter_username: "absministries", pdl_match_confidence: 96 },
{ email: "klcernero@gmail.com", linkedin_url: "linkedin.com/in/kathy-cernero-437138286", linkedin_username: "kathy-cernero-437138286", facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 19 },
{ email: "djodin2lc@gmail.com", linkedin_url: "linkedin.com/in/leonard-cummings-199385114", linkedin_username: "leonard-cummings-199385114", facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 94 },
{ email: "preacherjohnc1234@yahoo.com", linkedin_url: null, linkedin_username: null, facebook_url: "facebook.com/john.czekalski.5", facebook_username: "john.czekalski.5", twitter_url: null, twitter_username: null, pdl_match_confidence: 9 },
{ email: "cvervin@yahoo.com", linkedin_url: "linkedin.com/in/candace-ervin-4229b7225", linkedin_username: "candace-ervin-4229b7225", facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 95 },
{ email: "ehooten@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 97 },
{ email: "robert_house3000@yahoo.com", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 76 },
{ email: "shunsley27@yahoo.com", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 97 },
{ email: "lrjns11@gmail.com", linkedin_url: "linkedin.com/in/laurajones927", linkedin_username: "laurajones927", facebook_url: "facebook.com/laura.jones", facebook_username: "laura.jones", twitter_url: null, twitter_username: null, pdl_match_confidence: 99 },
{ email: "perezarmando907@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: "facebook.com/armando.perez.986", facebook_username: "armando.perez.986", twitter_url: null, twitter_username: null, pdl_match_confidence: 99 },
{ email: "waterwalker1115@me.com", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 94 },
{ email: "abundantfunding@usa.com", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 77 },
{ email: "codypucillo@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: "facebook.com/kcodylock", facebook_username: "kcodylock", twitter_url: null, twitter_username: null, pdl_match_confidence: 41 },
{ email: "reyes.ruthie@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 94 },
{ email: "sangotundesunday@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 27 },
{ email: "susan.shea@mail.com", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 96 },
{ email: "dejaitrosper@yahoo.com", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 96 },
{ email: "the_mr_warren@yahoo.com", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 48 },
{ email: "pwhite070958@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 95 },
{ email: "clwillis1@gmail.com", linkedin_url: "linkedin.com/in/clifford-willis-8062b65", linkedin_username: "clifford-willis-8062b65", facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 96 },
{ email: "zzimmerman100513@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 97 },
{ email: "benoityvetara27@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: "facebook.com/shenetta.preer", facebook_username: "shenetta.preer", twitter_url: null, twitter_username: null, pdl_match_confidence: 27 },
{ email: "BColllins@hancockhealth.org", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 22 },
{ email: "ravinderjit.amar@yahoo.com", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 99 },
{ email: "hannah.l.rutledge1@gmail.com", linkedin_url: "linkedin.com/in/hannahgrutledge", linkedin_username: "hannahgrutledge", facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 97 },
{ email: "mandybbsmith@gmail.com", linkedin_url: "linkedin.com/in/mandy-biszantz-smith-084a21159", linkedin_username: "mandy-biszantz-smith-084a21159", facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 99 },
{ email: "rosewaterfairy@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 41 },
{ email: "vinaykotte419@gmail.com", linkedin_url: "linkedin.com/in/vinay-kumar-kotte-5b060b151", linkedin_username: "vinay-kumar-kotte-5b060b151", facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 37 },
{ email: "addymajor03@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: "facebook.com/addison.galarno", facebook_username: "addison.galarno", twitter_url: null, twitter_username: null, pdl_match_confidence: 70 },
{ email: "victoriashaffer1993@gmail.com", linkedin_url: "linkedin.com/in/victoria-ricketts-b4523799", linkedin_username: "victoria-ricketts-b4523799", facebook_url: "facebook.com/victoria.shaffer.501", facebook_username: "victoria.shaffer.501", twitter_url: null, twitter_username: null, pdl_match_confidence: 75 },
{ email: "keerthiyns06@gmail.com", linkedin_url: "linkedin.com/in/naga-sai-divya-yerramsetty-18064460", linkedin_username: "naga-sai-divya-yerramsetty-18064460", facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 11 },
{ email: "webste52@purdue.edu", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 19 },
{ email: "lukas.vierling1@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: "facebook.com/bay.thaitu", facebook_username: "bay.thaitu", twitter_url: null, twitter_username: null, pdl_match_confidence: 39 },
{ email: "phetssou001@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: "facebook.com/corrina.jinks.1", facebook_username: "corrina.jinks.1", twitter_url: null, twitter_username: null, pdl_match_confidence: 26 },
{ email: "aochall@iu.edu", linkedin_url: "linkedin.com/in/aidenochall", linkedin_username: "aidenochall", facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 51 },
{ email: "ddouthit01.w@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: "facebook.com/destiny.douthit", facebook_username: "destiny.douthit", twitter_url: null, twitter_username: null, pdl_match_confidence: 19 },
{ email: "agnes.racelis@gmail.com", linkedin_url: "linkedin.com/in/maria-agnes-racelis-02a3341aa", linkedin_username: "maria-agnes-racelis-02a3341aa", facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 25 },
{ email: "colbywoodfork@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 22 },
{ email: "codyelainee@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 94 },
{ email: "walkerjm16@icloud.com", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 94 },
{ email: "aespegal@gmail.com", linkedin_url: "linkedin.com/in/ashleyefritz", linkedin_username: "ashleyefritz", facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 72 },
{ email: "lmlanders2003@yahoo.com", linkedin_url: "linkedin.com/in/lori-landers-94603b142", linkedin_username: "lori-landers-94603b142", facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 94 },
{ email: "madisonhille@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: "facebook.com/madison.hille.7", facebook_username: "madison.hille.7", twitter_url: null, twitter_username: null, pdl_match_confidence: 99 },
{ email: "braniellegarretts@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 27 },
{ email: "marissaclapp1324@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: "facebook.com/marissa.clapp.5", facebook_username: "marissa.clapp.5", twitter_url: null, twitter_username: null, pdl_match_confidence: 98 },
{ email: "awololakemi33@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 38 },
{ email: "codymatthewutigard@gmail.com", linkedin_url: "linkedin.com/in/cody-utigard-276240225", linkedin_username: "cody-utigard-276240225", facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 22 },
{ email: "lillianmt24@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: "facebook.com/lillian.towne.1", facebook_username: "lillian.towne.1", twitter_url: null, twitter_username: null, pdl_match_confidence: 99 },
{ email: "oconnoreemily44@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 55 },
{ email: "kaitlynlowesvball25@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 11 },
{ email: "destinyfmann@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 72 },
{ email: "akingery619@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 66 },
{ email: "rboye@iu.edu", linkedin_url: "linkedin.com/in/rachelcox-313", linkedin_username: "rachelcox-313", facebook_url: null, facebook_username: null, twitter_url: "twitter.com/rachelboye", twitter_username: "rachelboye", pdl_match_confidence: 12 },
{ email: "sgbolding1@icloud.com", linkedin_url: null, linkedin_username: null, facebook_url: "facebook.com/samantha.porter.5817", facebook_username: "samantha.porter.5817", twitter_url: null, twitter_username: null, pdl_match_confidence: 11 },
{ email: "blechasarah1@gmail.com", linkedin_url: "linkedin.com/in/sarahblecha", linkedin_username: "sarahblecha", facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 98 },
{ email: "tbyourkillinmesmallz23@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 99 },
{ email: "Taylorbailey913@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 10 },
{ email: "breannahsmith375@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 10 },
{ email: "nikkip136@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 95 },
{ email: "mlajter84@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 27 },
{ email: "dianyadulin41@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: "facebook.com/dianya.dulin", facebook_username: "dianya.dulin", twitter_url: null, twitter_username: null, pdl_match_confidence: 98 },
{ email: "hoodledonna2@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 96 },
{ email: "sierra.aldana218@gmail.com", linkedin_url: "linkedin.com/in/sierrawatt", linkedin_username: "sierrawatt", facebook_url: null, facebook_username: null, twitter_url: "twitter.com/rogersassociate", twitter_username: "rogersassociate", pdl_match_confidence: 15 },
{ email: "kojimamasan@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 76 },
{ email: "sazulhouser@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: "facebook.com/sabrina.houser.52", facebook_username: "sabrina.houser.52", twitter_url: null, twitter_username: null, pdl_match_confidence: 97 },
{ email: "bcaylor16@yahoo.com", linkedin_url: "linkedin.com/in/brittney-caylor-25b700160", linkedin_username: "brittney-caylor-25b700160", facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 13 },
{ email: "alyasher28@ivytech.edu", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 71 },
{ email: "BCook2@hancockhealth.org", linkedin_url: "linkedin.com/in/brian-cook-85a3a45", linkedin_username: "brian-cook-85a3a45", facebook_url: null, facebook_username: null, twitter_url: "twitter.com/bmc77us", twitter_username: "bmc77us", pdl_match_confidence: 95 },
{ email: "cynthia.millbern@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 72 },
{ email: "abby.luster@aol.com", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 36 },
{ email: "msnsmmns@gmail.com", linkedin_url: "linkedin.com/in/mason-simmons-32903a59", linkedin_username: "mason-simmons-32903a59", facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 99 },
{ email: "suttles.brittnee@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: "facebook.com/brittnee.suttles", facebook_username: "brittnee.suttles", twitter_url: null, twitter_username: null, pdl_match_confidence: 99 },
{ email: "jennifer.piworski@gmail.com", linkedin_url: "linkedin.com/in/jennifer-piworski-rn-02b529ab", linkedin_username: "jennifer-piworski-rn-02b529ab", facebook_url: "facebook.com/jennifer.piworski.3", facebook_username: "jennifer.piworski.3", twitter_url: null, twitter_username: null, pdl_match_confidence: 99 },
{ email: "rmaynard08@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 82 },
{ email: "amayleslie@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: "facebook.com/ashley.fosnight.7", facebook_username: "ashley.fosnight.7", twitter_url: null, twitter_username: null, pdl_match_confidence: 96 },
{ email: "jkleteck@icloud.com", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 96 },
{ email: "Amberlevans01@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 32 },
{ email: "lexibullock1@outlook.com", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 74 },
{ email: "ksmsm727@icloud.com", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 93 },
{ email: "ihuuomashaman@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 38 },
{ email: "lushblush1998@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: "facebook.com/hayley.neal.56", facebook_username: "hayley.neal.56", twitter_url: null, twitter_username: null, pdl_match_confidence: 97 },
{ email: "zoe.r.nelson@icloud.com", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 95 },
{ email: "normannia859@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: "facebook.com/maleah.lynn.14", facebook_username: "maleah.lynn.14", twitter_url: null, twitter_username: null, pdl_match_confidence: 5 },
{ email: "Woverstr@myninestar.net", linkedin_url: "linkedin.com/in/mary-overstreet-492b3a42", linkedin_username: "mary-overstreet-492b3a42", facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 95 },
{ email: "anishapathan1805@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 43 },
{ email: "rileylynn0908@yahoo.com", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 99 },
{ email: "jen_health1standerson@yahoo.com", linkedin_url: "linkedin.com/in/jennifer-peckinpaugh-ab454430", linkedin_username: "jennifer-peckinpaugh-ab454430", facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 97 },
{ email: "LPenn@hancockhealth.org", linkedin_url: null, linkedin_username: null, facebook_url: "facebook.com/lisa.penn.9465", facebook_username: "lisa.penn.9465", twitter_url: null, twitter_username: null, pdl_match_confidence: 96 },
{ email: "perkist@me.com", linkedin_url: "linkedin.com/in/stacie-perkins-17b89b63", linkedin_username: "stacie-perkins-17b89b63", facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 97 },
{ email: "opiatt@icloud.com", linkedin_url: null, linkedin_username: null, facebook_url: "facebook.com/liv.mae.52", facebook_username: "liv.mae.52", twitter_url: null, twitter_username: null, pdl_match_confidence: 95 },
{ email: "kathyplue@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: "facebook.com/kathy.huffplue", facebook_username: "kathy.huffplue", twitter_url: null, twitter_username: null, pdl_match_confidence: 98 },
{ email: "bsmithsmith17@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 34 },
{ email: "npowers198624@yahoo.com", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 95 },
{ email: "amiyahpribble8@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: "facebook.com/amiyah.pribble", facebook_username: "amiyah.pribble", twitter_url: null, twitter_username: null, pdl_match_confidence: 99 },
{ email: "kesymone95@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 11 },
{ email: "zoequick21@gmail.com", linkedin_url: "linkedin.com/in/jthollett", linkedin_username: "jthollett", facebook_url: null, facebook_username: null, twitter_url: "twitter.com/jthollett", twitter_username: "jthollett", pdl_match_confidence: 27 },
{ email: "saminicole88@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 95 },
{ email: "zmrichards2001@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 31 },
{ email: "mrswinters2010@yahoo.com", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 98 },
{ email: "jennifermyers1178@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: "facebook.com/jennifer.spencewhite", facebook_username: "jennifer.spencewhite", twitter_url: null, twitter_username: null, pdl_match_confidence: 78 },
{ email: "munizkarla317@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 75 },
{ email: "amounce@iuhealth.org", linkedin_url: "linkedin.com/in/amanda-mounce-800085194", linkedin_username: "amanda-mounce-800085194", facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 99 },
{ email: "morris44tia@icloud.com", linkedin_url: "linkedin.com/in/john-duncan-32bb4a67", linkedin_username: "john-duncan-32bb4a67", facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 14 },
{ email: "chelss_marie15@aol.com", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 97 },
{ email: "kmears@speedrome.com", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 97 },
{ email: "jowal2346@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: "facebook.com/joo23", facebook_username: "joo23", twitter_url: null, twitter_username: null, pdl_match_confidence: 71 },
{ email: "williamstawnya@yahoo.com", linkedin_url: "linkedin.com/in/tawnya-lea-williams-286b4b100", linkedin_username: "tawnya-lea-williams-286b4b100", facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 79 },
{ email: "gigiscraftique@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: "facebook.com/mpitmanmcdonald", facebook_username: "mpitmanmcdonald", twitter_url: null, twitter_username: null, pdl_match_confidence: 94 },
{ email: "m2jek5@aol.com", linkedin_url: null, linkedin_username: null, facebook_url: "facebook.com/dawna.mccloud", facebook_username: "dawna.mccloud", twitter_url: null, twitter_username: null, pdl_match_confidence: 99 },
{ email: "keoriamayfield@yahoo.com", linkedin_url: null, linkedin_username: null, facebook_url: "facebook.com/keoria.mayfield", facebook_username: "keoria.mayfield", twitter_url: null, twitter_username: null, pdl_match_confidence: 22 },
{ email: "lmay1427@gmail.com", linkedin_url: "linkedin.com/in/lori-may-97766588", linkedin_username: "lori-may-97766588", facebook_url: "facebook.com/lori.splatermay", facebook_username: "lori.splatermay", twitter_url: null, twitter_username: null, pdl_match_confidence: 96 },
{ email: "lildancermaxey@hotmail.com", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 99 },
{ email: "aliciamathews89@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 99 },
{ email: "leasya06@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 5 },
{ email: "maloneilliyah@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 98 },
{ email: "njmajors27@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 19 },
{ email: "magaro.martin.m@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 11 },
{ email: "chasidymadden79@yahoo.com", linkedin_url: "linkedin.com/in/chasidy-madden-34099762", linkedin_username: "chasidy-madden-34099762", facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 19 },
{ email: "chelseyluckmann@yahoo.com", linkedin_url: "linkedin.com/in/chelsey-luckmann-791614149", linkedin_username: "chelsey-luckmann-791614149", facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 99 },
{ email: "kaylalimburg92@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: "facebook.com/kachlimb", facebook_username: "kachlimb", twitter_url: null, twitter_username: null, pdl_match_confidence: 99 },
{ email: "lewischanita@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 97 },
{ email: "ashleyyazel1984@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: "facebook.com/ashley.yazel", facebook_username: "ashley.yazel", twitter_url: null, twitter_username: null, pdl_match_confidence: 74 },
{ email: "dawnielle1973@gmail.com", linkedin_url: "linkedin.com/in/april-wright-psychotherapist", linkedin_username: "april-wright-psychotherapist", facebook_url: null, facebook_username: null, twitter_url: "twitter.com/therapyapril", twitter_username: "therapyapril", pdl_match_confidence: 94 },
{ email: "shawnawilliams764@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: "facebook.com/martavius.ferguson", facebook_username: "martavius.ferguson", twitter_url: null, twitter_username: null, pdl_match_confidence: 43 },
{ email: "latoia88@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 97 },
{ email: "kareana0019@yahoo.com", linkedin_url: "linkedin.com/in/kareana-willey-b441b194", linkedin_username: "kareana-willey-b441b194", facebook_url: "facebook.com/katrainwreck", facebook_username: "katrainwreck", twitter_url: null, twitter_username: null, pdl_match_confidence: 99 },
{ email: "whitsonjustins@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 94 },
{ email: "Anyea0226@yahoo.com", linkedin_url: null, linkedin_username: null, facebook_url: "facebook.com/anyea.white", facebook_username: "anyea.white", twitter_url: null, twitter_username: null, pdl_match_confidence: 17 },
{ email: "smwheeler@eagles.usi.edu", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 74 },
{ email: "oliviamwehr05@gmail.com", linkedin_url: "linkedin.com/in/olivia-wehr-4a04072aa", linkedin_username: "olivia-wehr-4a04072aa", facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 13 },
{ email: "nicolewall2168@gmail.com", linkedin_url: "linkedin.com/in/nicole-wall-6b7799a1", linkedin_username: "nicole-wall-6b7799a1", facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 96 },
{ email: "chalasu@yahoo.com", linkedin_url: "linkedin.com/in/chalas-underwood-78a85611", linkedin_username: "chalas-underwood-78a85611", facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 99 },
{ email: "ginawood24@yahoo.com", linkedin_url: "linkedin.com/in/georgina-tyner-578154180", linkedin_username: "georgina-tyner-578154180", facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 19 },
{ email: "mrshall0413@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: "facebook.com/aignea.tillman", facebook_username: "aignea.tillman", twitter_url: null, twitter_username: null, pdl_match_confidence: 19 },
{ email: "persinger1965@yahoo.com", linkedin_url: "linkedin.com/in/lori-thomas-54831141", linkedin_username: "lori-thomas-54831141", facebook_url: "facebook.com/lori.thomas.562", facebook_username: "lori.thomas.562", twitter_url: null, twitter_username: null, pdl_match_confidence: 95 },
{ email: "thomaskate97@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 94 },
{ email: "87brthomas@gmail.com", linkedin_url: "linkedin.com/in/brittany-thomas-35025050", linkedin_username: "brittany-thomas-35025050", facebook_url: "facebook.com/brittanyrose", facebook_username: "brittanyrose", twitter_url: null, twitter_username: null, pdl_match_confidence: 95 },
{ email: "merry.a316i@gmail.com", linkedin_url: "linkedin.com/in/merry-thamrin-a38871260", linkedin_username: "merry-thamrin-a38871260", facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 17 },
{ email: "towerwife91@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: "facebook.com/lips.like.morphine07", facebook_username: "lips.like.morphine07", twitter_url: null, twitter_username: null, pdl_match_confidence: 96 },
{ email: "lftalbot34@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 17 },
{ email: "bailey.swift@sbcglobal.net", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 97 },
{ email: "holliesumpter0989@gmail.com", linkedin_url: "linkedin.com/in/hollie-sumpter-bb7702108", linkedin_username: "hollie-sumpter-bb7702108", facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 16 },
{ email: "kimstrader@yahoo.com", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 97 },
{ email: "AStout@hancockhealth.org", linkedin_url: null, linkedin_username: null, facebook_url: "facebook.com/ash.stouter.3", facebook_username: "ash.stouter.3", twitter_url: null, twitter_username: null, pdl_match_confidence: 35 },
{ email: "jada.storms.2018@icloud.com", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 16 },
{ email: "jessiccas1@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 98 },
{ email: "lthornton95@gmail.com", linkedin_url: "linkedin.com/in/laura-thornton-5825a6149", linkedin_username: "laura-thornton-5825a6149", facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 75 },
{ email: "dstanley6425@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: "facebook.com/brookelyn.stanley", facebook_username: "brookelyn.stanley", twitter_url: null, twitter_username: null, pdl_match_confidence: 27 },
{ email: "sestafford@hotmail.com", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 95 },
{ email: "spiritspringfield@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: "facebook.com/ladytriples", facebook_username: "ladytriples", twitter_url: null, twitter_username: null, pdl_match_confidence: 99 },
{ email: "wendyfrancis1@comcast.net", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 71 },
{ email: "sheilonda.smith@yahoo.com", linkedin_url: null, linkedin_username: null, facebook_url: "facebook.com/sheilonda.smith", facebook_username: "sheilonda.smith", twitter_url: null, twitter_username: null, pdl_match_confidence: 99 },
{ email: "jgrady6585@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 79 },
{ email: "ambersmith318@aol.com", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 93 },
{ email: "theskeltonfamily110@yahoo.com", linkedin_url: null, linkedin_username: null, facebook_url: "facebook.com/jivis.finnegan", facebook_username: "jivis.finnegan", twitter_url: null, twitter_username: null, pdl_match_confidence: 37 },
{ email: "Kaylasiegfried.connect@gmail.com", linkedin_url: "linkedin.com/in/kayla-siegfried-ba92a744", linkedin_username: "kayla-siegfried-ba92a744", facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 6 },
{ email: "Katherinejshields@yahoo.com", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 95 },
{ email: "Johnnasegner@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: "facebook.com/johnna.segner", facebook_username: "johnna.segner", twitter_url: null, twitter_username: null, pdl_match_confidence: 99 },
{ email: "gabbyr439@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 99 },
{ email: "vwhitlock46@gmail.com", linkedin_url: "linkedin.com/in/yvette-whitlock-1822b858", linkedin_username: "yvette-whitlock-1822b858", facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 77 },
{ email: "jrobinson1615@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 77 },
{ email: "laredomartin21@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: "facebook.com/laredo.martin", facebook_username: "laredo.martin", twitter_url: null, twitter_username: null, pdl_match_confidence: 80 },
{ email: "hnfoust@gmail.com", linkedin_url: "linkedin.com/in/hailey-foust-mba-22557b74", linkedin_username: "hailey-foust-mba-22557b74", facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 13 },
{ email: "foulksa1222@gmail.com", linkedin_url: "linkedin.com/in/abbigail-foulks-61878996", linkedin_username: "abbigail-foulks-61878996", facebook_url: "facebook.com/abbigail.walker2", facebook_username: "abbigail.walker2", twitter_url: null, twitter_username: null, pdl_match_confidence: 99 },
{ email: "janetluskfeeney@gmail.com", linkedin_url: "linkedin.com/in/janet-feeney-65a93a76", linkedin_username: "janet-feeney-65a93a76", facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 97 },
{ email: "sahrashfatima8@gmail.com", linkedin_url: "linkedin.com/in/sahrash-fatima", linkedin_username: "sahrash-fatima", facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 98 },
{ email: "rachelkuscu34@yahoo.com", linkedin_url: null, linkedin_username: null, facebook_url: "facebook.com/liz.manduu", facebook_username: "liz.manduu", twitter_url: null, twitter_username: null, pdl_match_confidence: 36 },
{ email: "tfranklin0817@gmail.com", linkedin_url: "linkedin.com/in/tiffany-ellsworth-4bb2371b0", linkedin_username: "tiffany-ellsworth-4bb2371b0", facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 97 },
{ email: "abigaillowe1998@gmail.com", linkedin_url: "linkedin.com/in/abigail-ellison-9a7a4617b", linkedin_username: "abigail-ellison-9a7a4617b", facebook_url: "facebook.com/abigail.lowe.7", facebook_username: "abigail.lowe.7", twitter_url: null, twitter_username: null, pdl_match_confidence: 99 },
{ email: "22.audrie.dungan@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 42 },
{ email: "jessicadicristofolo@gmail.com", linkedin_url: "linkedin.com/in/jessicadicristofolo", linkedin_username: "jessicadicristofolo", facebook_url: "facebook.com/jdicristofolo", facebook_username: "jdicristofolo", twitter_url: null, twitter_username: null, pdl_match_confidence: 79 },
{ email: "davismj564@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 19 },
{ email: "bdavid1988@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: "facebook.com/betty.david.123829", facebook_username: "betty.david.123829", twitter_url: null, twitter_username: null, pdl_match_confidence: 99 },
{ email: "danielemma444222@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: "facebook.com/aaron.robinson.1840", facebook_username: "aaron.robinson.1840", twitter_url: null, twitter_username: null, pdl_match_confidence: 47 },
{ email: "willowcrouch2023@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: "facebook.com/duwayne.stapleton.9", facebook_username: "duwayne.stapleton.9", twitter_url: null, twitter_username: null, pdl_match_confidence: 36 },
{ email: "darrencroney2@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 98 },
{ email: "cranepaular@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: "facebook.com/bookishnerd22", facebook_username: "bookishnerd22", twitter_url: null, twitter_username: null, pdl_match_confidence: 94 },
{ email: "candihobbs13@hotmail.com", linkedin_url: null, linkedin_username: null, facebook_url: "facebook.com/candi.hobbs.75", facebook_username: "candi.hobbs.75", twitter_url: null, twitter_username: null, pdl_match_confidence: 43 },
{ email: "a.e.closser@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 96 },
{ email: "hanna.chew@hoosieryouth.org", linkedin_url: "linkedin.com/in/hanna-chew-9aa197b5", linkedin_username: "hanna-chew-9aa197b5", facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 10 },
{ email: "elviachavez5.ec@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 95 },
{ email: "princess_gwinn@yahoo.com", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 54 },
{ email: "CASTLEBERRYADRI@GMAIL.COM", linkedin_url: null, linkedin_username: null, facebook_url: "facebook.com/adricastleberry122", facebook_username: "adricastleberry122", twitter_url: null, twitter_username: null, pdl_match_confidence: 98 },
{ email: "emmaburkett19@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: "facebook.com/oot.jef", facebook_username: "oot.jef", twitter_url: null, twitter_username: null, pdl_match_confidence: 36 },
{ email: "myrandakbrks03@icloud.com", linkedin_url: "linkedin.com/in/randykurz", linkedin_username: "randykurz", facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 8 },
{ email: "brynnabowen2003@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 17 },
{ email: "chynabounds50@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 96 },
{ email: "kayla@borowicz.org", linkedin_url: "linkedin.com/in/leann-rohr-70851146", linkedin_username: "leann-rohr-70851146", facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 38 },
{ email: "wm.daltonblakley@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 79 },
{ email: "bienaimedorymike97@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 98 },
{ email: "iyanabenson94@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 98 },
{ email: "bethbkr4@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 81 },
{ email: "mandyb1987@yahoo.com", linkedin_url: null, linkedin_username: null, facebook_url: "facebook.com/mandyb87", facebook_username: "mandyb87", twitter_url: null, twitter_username: null, pdl_match_confidence: 79 },
{ email: "hmartist.cb@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: "facebook.com/rafa.gonzalezcalderon.98", facebook_username: "rafa.gonzalezcalderon.98", twitter_url: null, twitter_username: null, pdl_match_confidence: 41 },
{ email: "kendra_5750@hotmail.com", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 97 },
{ email: "whitneymsheeley@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 65 },
{ email: "braedon.160@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: "facebook.com/braedon.arnett.16", facebook_username: "braedon.arnett.16", twitter_url: null, twitter_username: null, pdl_match_confidence: 99 },
{ email: "allysonhij3@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: "facebook.com/allyson.armand", facebook_username: "allyson.armand", twitter_url: null, twitter_username: null, pdl_match_confidence: 27 },
{ email: "15courtney51@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 38 },
{ email: "jaximicaalston121@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: "facebook.com/jaximica.alston.73", facebook_username: "jaximica.alston.73", twitter_url: null, twitter_username: null, pdl_match_confidence: 22 },
{ email: "pfrenchy_az@yahoo.com", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 94 },
{ email: "zachary.lauder18@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: "facebook.com/bert.acton.90", facebook_username: "bert.acton.90", twitter_url: null, twitter_username: null, pdl_match_confidence: 39 },
{ email: "Tashamcbeath@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 74 },
{ email: "briannalafave92@yahoo.com", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 95 },
{ email: "brockking17@gmail.com", linkedin_url: "linkedin.com/in/brock-king-112389192", linkedin_username: "brock-king-112389192", facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 94 },
{ email: "manpritgoraya736@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 96 },
{ email: "shahna.jones@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: "facebook.com/shahna.jones.7", facebook_username: "shahna.jones.7", twitter_url: null, twitter_username: null, pdl_match_confidence: 73 },
{ email: "mjones46140@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: "facebook.com/megan.h.jones.9", facebook_username: "megan.h.jones.9", twitter_url: null, twitter_username: null, pdl_match_confidence: 94 },
{ email: "lady.zene@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: "facebook.com/brittany.reed.52438", facebook_username: "brittany.reed.52438", twitter_url: null, twitter_username: null, pdl_match_confidence: 99 },
{ email: "shumate.julie@yahoo.com", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 62 },
{ email: "jenkinsnya84@gmail.com", linkedin_url: "linkedin.com/in/nya-jenkins-856117204", linkedin_username: "nya-jenkins-856117204", facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 6 },
{ email: "crystalpitman@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: "facebook.com/crystal.jacobs87", facebook_username: "crystal.jacobs87", twitter_url: null, twitter_username: null, pdl_match_confidence: 96 },
{ email: "Briannakilly@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 22 },
{ email: "aehoward1@comcast.net", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 99 },
{ email: "annamarie969@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 96 },
{ email: "Kierrahinton4@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 97 },
{ email: "animenikki03@hotmail.com", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 80 },
{ email: "fmadriz10713@icloud.com", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 37 },
{ email: "carlagarescher@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 78 },
{ email: "ayriasg@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: "facebook.com/ayrias.garrett", facebook_username: "ayrias.garrett", twitter_url: null, twitter_username: null, pdl_match_confidence: 19 },
{ email: "gibson61780@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 94 },
{ email: "alglascoe29@gmail.com", linkedin_url: "linkedin.com/in/paul-harris-02b14025", linkedin_username: "paul-harris-02b14025", facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 11 },
{ email: "chelseaweir@yahoo.com", linkedin_url: "linkedin.com/in/dawn-owens-58a08025", linkedin_username: "dawn-owens-58a08025", facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 45 },
{ email: "leora28@icloud.com", linkedin_url: null, linkedin_username: null, facebook_url: "facebook.com/julie.goforth.33", facebook_username: "julie.goforth.33", twitter_url: null, twitter_username: null, pdl_match_confidence: 96 },
{ email: "missamarie1020@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 42 },
{ email: "zoeyhunsinger@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 76 },
{ email: "ajsimon211@gmail.com", linkedin_url: "linkedin.com/in/amy-simon-82877630", linkedin_username: "amy-simon-82877630", facebook_url: "facebook.com/ajsimon211", facebook_username: "ajsimon211", twitter_url: "twitter.com/amysheets", twitter_username: "amysheets", pdl_match_confidence: 98 },
{ email: "cahaggard@rocketmail.com", linkedin_url: "linkedin.com/in/christina-haggard-81259ab3", linkedin_username: "christina-haggard-81259ab3", facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 99 },
{ email: "rhardin1020@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 12 },
{ email: "nhaste2974@gmail.com", linkedin_url: "linkedin.com/in/natalie-haste-aabb72167", linkedin_username: "natalie-haste-aabb72167", facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 13 },
{ email: "jstephens59099@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 95 },
{ email: "adhenderson96@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 60 },
{ email: "LHerald@hancockhealth.org", linkedin_url: "linkedin.com/in/lesley-herald-a14486a0", linkedin_username: "lesley-herald-a14486a0", facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 98 },
{ email: "kiara_hernandez2000@yahoo.com", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 95 },
{ email: "enh1796@icloud.com", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 6 },
{ email: "carolecromer@yahoo.com", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 98 },
{ email: "summerjones758@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 94 },
{ email: "april@stillingerfamily.com", linkedin_url: "linkedin.com/in/april-stillinger-783615247", linkedin_username: "april-stillinger-783615247", facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 99 },
{ email: "hjyount811@gmail.com", linkedin_url: "linkedin.com/in/hannah-napier-906b0329", linkedin_username: "hannah-napier-906b0329", facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 73 },
{ email: "taylormosier076@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: "facebook.com/mike.ellis.31945", facebook_username: "mike.ellis.31945", twitter_url: null, twitter_username: null, pdl_match_confidence: 46 },
{ email: "ccook208@marian.edu", linkedin_url: null, linkedin_username: null, facebook_url: "facebook.com/chloe.cook.37819", facebook_username: "chloe.cook.37819", twitter_url: null, twitter_username: null, pdl_match_confidence: 96 },
{ email: "kgreenwood9@ivytech.edu", linkedin_url: null, linkedin_username: null, facebook_url: "facebook.com/kara.greenwood.9", facebook_username: "kara.greenwood.9", twitter_url: null, twitter_username: null, pdl_match_confidence: 94 },
{ email: "lweb909@gmail.com", linkedin_url: null, linkedin_username: null, facebook_url: null, facebook_username: null, twitter_url: null, twitter_username: null, pdl_match_confidence: 98 },
];
enrichedData=enrichedData.slice(93);

function getEnrichedProfile(email) {
if (!email) return null;
return enrichedData.find(
e => e.email.toLowerCase() === email.toLowerCase()
) || null;
}

peopledatalabs.auth('30d80327aac2828dd4df86eaf9ec379dd5bae8d495490b2c41f4f313ca34adea');

function decayWeight(n) {
const base = [1.0, 0.5, 0.25];
const additional = Math.max(n - 3, 0);
return base
.concat(Array(additional).fill(0.10))
.slice(0, n)
.reduce((a, b) => a + b, 0);
}

function determineRiskLevel(overallScore) {
// Lower scores = Higher risk (more negative keywords found)
if (overallScore <= 3) return 'High';
if (overallScore <= 6) return 'Medium';
return 'Low';
}

function sleep(ms) {
return new Promise(resolve => setTimeout(resolve, ms));
}

class RateLimiter {
constructor(requestsPerMinute) {
this.minDelay = 60000 / requestsPerMinute;
this.lastCall = 0;
}
async throttle() {
const now = Date.now();
const wait = this.minDelay - (now - this.lastCall);
if (wait > 0) await sleep(wait);
this.lastCall = Date.now();
}
}

const facebookLimiter = new RateLimiter(2);
const linkedinLimiter = new RateLimiter(10);
const twitterLimiter = new RateLimiter(10);


function calculatePossibleImprovement(categoryScores) {
const scores = Object.values(categoryScores);
if (scores.length === 0) return 0;

// Find the highest risk category (highest score = most issues)
const maxScore = Math.max(...scores);
// Calculate average of other categories
const otherScores = scores.filter(s => s !== maxScore);
const avgOthers = otherScores.length > 0
? otherScores.reduce((a, b) => a + b, 0) / otherScores.length
: 0;

// Possible improvement if the highest risk category is reduced to average
return (avgOthers * scores.length / 100 * 10).toFixed(2);
}

function determineCategoryOfConcern(categoryScores) {
const entries = Object.entries(categoryScores);
if (entries.length === 0) return 'N/A';

// Find category with highest score (most problematic)
const highest = entries.reduce((max, curr) => curr[1] > max[1] ? curr : max);
return highest[0];
}


async function generateOutputFile(results, outputFileName) {

const outputData = results.map((emp, index) => ({
'Employee Number': index + 1,
'Employee Name': emp.name,
'Work Life Balance': emp.categoryScores['work life'] || 0,
'Communication': emp.categoryScores['family'] || 0,
'Financial': emp.categoryScores['finances'] || 0,
'Schedule': emp.categoryScores['schedule'] || 0,
'Final Score': emp.overallScore || 0,
'Improvement Area': '',
'Risk Level': determineRiskLevel(emp.overallScore),
'Possible Improvement': calculatePossibleImprovement(emp.categoryScores),
'Category of Concern': determineCategoryOfConcern(emp.categoryScores)
}));

// ─── Build CSV string ───────────────────────────────────────────
const headers = Object.keys(outputData[0]);
const escapeCell = (val) => {
const str = String(val ?? '');
// wrap in quotes if value contains comma, quote, or newline
return str.includes(',') || str.includes('"') || str.includes('\n')
? `"${str.replace(/"/g, '""')}"`
: str;
};
const csvRows = [
headers.map(escapeCell).join(','),
...outputData.map(row => headers.map(h => escapeCell(row[h])).join(','))
];
const csvString = csvRows.join('\n');

// ─── Write CSV to disk ──────────────────────────────────────────
const csvFileName = outputFileName.replace(/\.xlsx$/, '.csv');
const dir = path.dirname(csvFileName);
if (!fs.existsSync(dir)) {
fs.mkdirSync(dir, { recursive: true });
}
fs.writeFileSync(csvFileName, csvString, 'utf8');

let cloudfile = await cloudinaryUpload(csvFileName);
return cloudfile.url;
}


// Optimized function to fetch all posts once per employee
async function fetchAllSocialMediaPosts(socialMedia) {
const rapidApiErrors = [];

try {
const allPosts = [];

// LinkedIn posts
if (socialMedia.linkedin_url) {
try {
const linkedinPosts = [];
let start = 0;
let pagination_token = null;
let pageCount = 0;

do {
const params = {
linkedin_url: socialMedia.linkedin_url,
type: 'posts',
start: start
};
if (pagination_token) params.pagination_token = pagination_token;

const linkedinOptions = {
method: 'GET',
url: 'https://fresh-linkedin-profile-data.p.rapidapi.com/get-profile-posts',
params,
headers: {
'Content-Type': 'application/json',
'x-rapidapi-key': '0b3e816b4bmsh5fb872b56e6e57cp1bfa08jsn3b9970e67894',
'x-rapidapi-host': 'fresh-linkedin-profile-data.p.rapidapi.com'
}
};

let linkedinResponse;
let retries = 0;
while (retries < 5) {
try {

linkedinResponse = await axios.request(linkedinOptions);
break;
} catch (retryErr) {
if (retryErr.response?.status === 429) {
retries++;
const waitTime = Math.min(15000 * Math.pow(2, retries), 120000);
console.log(`[LINKEDIN] ⏳ 429 Rate limit — retry ${retries}/5, waiting ${waitTime/1000}s...`);

} else {
throw retryErr;
}
}
}
if (!linkedinResponse) throw new Error('LinkedIn rate limit — max retries exceeded');
const data = linkedinResponse.data?.data || [];
const paging = linkedinResponse.data?.paging;
console.log(`[LINKEDIN] Raw API response keys:`, JSON.stringify(Object.keys(linkedinResponse.data || {})));
console.log(`[LINKEDIN] Raw paging:`, JSON.stringify(paging));
console.log(`[LINKEDIN] data.length: ${data.length}`);

if (data.length === 0) break;

const pagePosts = data
.filter(post => post?.text || post?.resharedPost?.text)
.map(post => ({
text: post.text || post.resharedPost?.text,
network: 'linkedin'
}));

linkedinPosts.push(...pagePosts);
pageCount++;


console.log("LINKELDINPOSTS")
console.log(linkedinPosts)
console.log(`[LINKEDIN] Page ${pageCount} | This page: ${pagePosts.length} posts | Total so far: ${linkedinPosts.length} | Has more: ${paging?.pagination_token && data.length === paging.count ? 'YES' : 'NO'}`);

if (paging?.pagination_token && data.length > 0) {
pagination_token = paging.pagination_token;
start = start + paging.count;
} else {
break;
}

} while (true);

console.log(`[LINKEDIN] ✅ DONE — ${linkedinPosts.length} total posts across ${pageCount} pages`);
allPosts.push(...linkedinPosts);

} catch (error) {
rapidApiErrors.push({ platform: 'linkedin', message: error.message, status: error.response?.status || null });
console.error('[LINKEDIN] ❌ Error:', error.message);
}
}

// Twitter posts
if (socialMedia.twitter_username) {
try {
const twitterOptions = {
method: 'GET',
url: 'https://twitter241.p.rapidapi.com/user',
params: { username: socialMedia.twitter_username },
headers: {
'x-rapidapi-key': '0b3e816b4bmsh5fb872b56e6e57cp1bfa08jsn3b9970e67894',
'x-rapidapi-host': 'twitter241.p.rapidapi.com'
}
};

let twitterResponse;
let userRetries = 0;
while (userRetries < 5) {
try {

twitterResponse = await axios.request(twitterOptions);
break;
} catch (retryErr) {
if (retryErr.response?.status === 429) {
userRetries++;
const waitTime = 15000 * userRetries;
console.log(`[TWITTER] ⏳ 429 Rate limit (user lookup) — retry ${userRetries}/5, waiting ${waitTime/1000}s...`);

} else {
throw retryErr;
}
}
}
if (!twitterResponse) throw new Error('Twitter rate limit — max retries exceeded');
const userId = twitterResponse.data.result.data.user.result.rest_id;
const twitterPosts = [];
const seenTexts = new Set();
let cursor = null;
let pageCount = 0;

do {
const params = { user: userId, count: '20' };
if (cursor) params.cursor = cursor;

const twitterPostOptions = {
method: 'GET',
url: 'https://twitter241.p.rapidapi.com/user-tweets',
params,
headers: {
'x-rapidapi-key': '0b3e816b4bmsh5fb872b56e6e57cp1bfa08jsn3b9970e67894',
'x-rapidapi-host': 'twitter241.p.rapidapi.com'
}
};

let twitterPostResponse;
let postRetries = 0;
while (postRetries < 5) {
try {

twitterPostResponse = await axios.request(twitterPostOptions);
break;
} catch (retryErr) {
if (retryErr.response?.status === 429) {
postRetries++;
const waitTime = Math.min(20000 * Math.pow(2, postRetries), 180000);
console.log(`[TWITTER] ⏳ 429 Rate limit (posts) — retry ${postRetries}/5, waiting ${waitTime/1000}s...`);

} else {
throw retryErr;
}
}
}
if (!twitterPostResponse) throw new Error('Twitter posts rate limit — max retries exceeded');
const instructions = twitterPostResponse.data.result.timeline.instructions;

const entries = instructions
.find(i => i.type === "TimelineAddEntries")?.entries || [];

const pagePosts = entries
.filter(entry => {
if (!entry.entryId?.startsWith("tweet-")) return false;
// Guard against malformed/promoted/tombstoned tweet entries
const legacy = entry.content?.itemContent?.tweet_results?.result?.legacy;
return !!legacy?.full_text;
})
.map(entry => ({
text: entry.content.itemContent.tweet_results.result.legacy.full_text,
network: 'twitter'
}));

if (pagePosts.length === 0) break;
const uniquePagePosts = pagePosts.filter(p => !seenTexts.has(p.text));
uniquePagePosts.forEach(p => seenTexts.add(p.text));

if (uniquePagePosts.length === 0) {
console.log(`[TWITTER] ⛔ All posts on this page already seen — cursor is looping, stopping`);
break;
}

twitterPosts.push(...uniquePagePosts);
console.log(`[TWITTER] Page ${pageCount + 1} NEW posts only:`, pagePosts.map(p => p.text.slice(0, 60)));
pageCount++;

const cursorEntry = entries.find(entry => entry.entryId?.startsWith("cursor-bottom"));
const newCursor = cursorEntry?.content?.value
|| twitterPostResponse.data?.result?.cursor?.bottom
|| null;

console.log(`[TWITTER] Page ${pageCount} | This page: ${pagePosts.length} posts | Total so far: ${twitterPosts.length} | Has more: ${newCursor ? 'YES' : 'NO'}`);

// Stop if cursor hasn't changed (prevents infinite loop of repeated posts)
if (!newCursor || newCursor === cursor) {
console.log(`[TWITTER] ⛔ Cursor unchanged or null — stopping pagination`);
break;
}

cursor = newCursor;


} while (cursor);

console.log(`[TWITTER] ✅ DONE — ${twitterPosts.length} total posts across ${pageCount} pages`);
allPosts.push(...twitterPosts);

} catch (error) {
rapidApiErrors.push({ platform: 'twitter', message: error.message, status: error.response?.status || null });
console.error('[TWITTER] ❌ Error:', error.message);
}
}

// Facebook posts
if (socialMedia.facebook_username) {
try {

const facebookOptions = {
method: 'GET',
url: 'https://facebook-scraper3.p.rapidapi.com/profile/details_url',
params: { url: socialMedia.facebook_url || `https://facebook.com/${socialMedia.facebook_username}` },
headers: {
'x-rapidapi-key': '0b3e816b4bmsh5fb872b56e6e57cp1bfa08jsn3b9970e67894',
'x-rapidapi-host': 'facebook-scraper3.p.rapidapi.com'
}
};

let facebookResponse;
let retries = 0;
while (retries < 5) {
try {
facebookResponse = await axios.request(facebookOptions);
break;
} catch (retryErr) {
if (retryErr.response?.status === 429) {
retries++;
const waitTime = Math.min(15000 * Math.pow(2, retries), 120000);
console.log(`[FACEBOOK] ⏳ 429 Rate limit — retry ${retries}/5, waiting ${waitTime/1000}s...`);

} else {
throw retryErr;
}
}
}
if (!facebookResponse) throw new Error('Facebook rate limit — max retries exceeded');
const profileId = facebookResponse.data.profile.profile_id;


const facebookPosts = [];
let cursor = null;
let pageCount = 0;

do {
const params = { profile_id: profileId };
if (cursor) params.cursor = cursor;

const facebookPostOptions = {
method: 'GET',
url: 'https://facebook-scraper3.p.rapidapi.com/profile/posts',
params,
headers: {
'x-rapidapi-key': '0b3e816b4bmsh5fb872b56e6e57cp1bfa08jsn3b9970e67894',
'x-rapidapi-host': 'facebook-scraper3.p.rapidapi.com'
}
};

let facebookPostResponse;
let postRetries = 0;
while (postRetries < 5) {
try {

facebookPostResponse = await axios.request(facebookPostOptions);
break;
} catch (retryErr) {
if (retryErr.response?.status === 429) {
postRetries++;
const waitTime = Math.min(30000 * Math.pow(2, postRetries), 300000);
console.log(`[FACEBOOK] ⏳ 429 Rate limit (posts page) — retry ${postRetries}/5, waiting ${waitTime/1000}s...`);

} else {
throw retryErr;
}
}
}
if (!facebookPostResponse) throw new Error('Facebook posts rate limit — max retries exceeded');
const results = facebookPostResponse.data.results || [];

if (results.length === 0) break;

const pagePosts = results
.filter(post => post.message)
.map(post => ({ text: post.message, network: 'facebook' }));

facebookPosts.push(...pagePosts);
console.log(facebookPosts)
console.log("FACEBOOKPOSTS")
pageCount++;

cursor = facebookPostResponse.data?.cursor || null;
console.log(`[FACEBOOK] Page ${pageCount} | This page: ${pagePosts.length} posts | Total so far: ${facebookPosts.length} | Has more: ${cursor ? 'YES' : 'NO'}`);
console.log(`[FACEBOOK] Page ${pageCount} post texts:`, pagePosts.map(p => p.text?.slice(0, 80)));
const allTexts = facebookPosts.map(p => p.text);
const uniqueTexts = new Set(allTexts);
console.log(`[FACEBOOK] Unique posts so far: ${uniqueTexts.size} / ${facebookPosts.length} total (${facebookPosts.length - uniqueTexts.size} duplicates)`);


} while (cursor);

console.log(`[FACEBOOK] ✅ DONE — ${facebookPosts.length} total posts across ${pageCount} pages`);
allPosts.push(...facebookPosts);

} catch (error) {
rapidApiErrors.push({ platform: 'facebook', message: error.message, status: error.response?.status || null });
console.error('[FACEBOOK] ❌ Error:', error.message);
if (error.message.includes('rate limit') || error.message.includes('max retries')) {
console.log('[FACEBOOK] 💤 Cooling down for 3 minutes before next employee...');

}
}
}

console.log("ALL POSTS")
console.log(allPosts)
return { posts: allPosts, rapidApiErrors };
} catch (error) {
console.error('[SCRAPER] ❌ Overall Error:', error.message);
return [];
}
}

function calculateAgePoints(dateOfBirth) {
if (!dateOfBirth) return 0;
const dob = new Date(dateOfBirth);
const today = new Date();
let age = today.getFullYear() - dob.getFullYear();
const m = today.getMonth() - dob.getMonth();
if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
if (isNaN(age)) return 0;

if (age >= 20 && age <= 24) return 10;
if (age >= 25 && age <= 34) return 7;
if (age >= 35 && age <= 44) return 5;
if (age >= 45 && age <= 54) return 3;
if (age >= 55 && age <= 64) return 1;
return 0; // 65+
}

function calculateTenurePoints(hireDate) {
if (!hireDate) return 0;
const hire = new Date(hireDate);
const today = new Date();
const months = (today.getFullYear() - hire.getFullYear()) * 12 + (today.getMonth() - hire.getMonth());

if (months <= 3) return 15;
if (months <= 6) return 10;
if (months <= 12) return 7;
if (months <= 24) return 5;
if (months <= 36) return 3;
if (months <= 60) return -1;
return -1; // 5+ years
}

function calculateFinancePoints(score) {
if (score <= 2) return 3;
if (score <= 4) return 2;
if (score <= 5) return 1;
if (score <= 6) return 0;
if (score <= 7) return -1;
if (score <= 8) return -3;
return -7; // 9-10
}

function calculateSchedulePoints(score) {
if (score <= 1) return 7;
if (score <= 3) return 2;
if (score <= 5) return 0;
if (score <= 6) return -1;
if (score <= 8) return -3; // ← was -5
return -5; // 9-10
}


function calculateWLBPoints(score) {
if (score <= 1) return 7;
if (score <= 3) return 3;
if (score <= 5) return 1;
if (score <= 6) return 0;
if (score <= 8) return -3;
return -5; // 9-10
}

function calculateFamilyPoints(score) {
if (score <= 2) return 5;
if (score <= 4) return 3;
if (score <= 6) return 0;
if (score <= 7) return -1;
if (score <= 8) return -3;
return -5; // 9-10
}

function calculateTurnoverPoints(termDate) {
// If employee has a term date, higher turnover risk
if (termDate && termDate !== 'N/A' && termDate !== '') return 9;
return 6;
}

function calculateRightFit(retentionScore) {
return retentionScore >= 20;
}

async function saveFileDataToAirtableInBatch(employees) {
try {
const Airtable = require('airtable');
const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);
const table = base(process.env.AIRTABLE_FILE_DATA_TABLE_ID);

function toDate(val) {
if (!val || val === 'N/A' || val === '') return null;
const parts = val.split('/');
if (parts.length === 3) {
return `${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
}
return val;
}

const records = employees.map(emp => ({
fields: {
'Employee Name (Last Suffix, First MI)': emp['Employee Name (Last Suffix, First MI)'] || '',
'Address Line 1 + Address Line 2': emp['Address Line 1 + Address Line 2'] || '',
'City, State Zip Code (Formatted)': emp['City, State Zip Code (Formatted)'] || '',
'E-mail Address': emp['E-mail Address'] || '',
'Hire Date': toDate(emp['Hire Date']),
'Term Date': toDate(emp['Term Date']),
'Organization': emp['Organization'] || '',
'Division': emp['Division'] || '',
'Department': emp['Department'] || '',
'Job Class': emp['Job Class'] || '',
'Date of Birth': toDate(emp['Date of Birth']),
'Finance Score (1-10)': parseFloat(emp['Finance Score (1-10)']) || 0,
'Schedule Score (1-10)': parseFloat(emp['Schedule Score (1-10)']) || 0,
'Work Life Balance Score (1-10)': parseFloat(emp['Work Life Balance Score (1-10)']) || 0,
'Family Score (1-10)': parseFloat(emp['Family Score (1-10)']) || 0,
'Distance (Miles)': parseFloat(emp['Distance (Miles)']) || 0,
}
}));

for (let i = 0; i < records.length; i += 10) {
const chunk = records.slice(i, i + 10);
await table.create(chunk);
console.log(`✅ Airtable (FileData) batch ${i + 1}–${i + chunk.length}`);
}
} catch (error) {
console.error(`❌ Airtable (FileData) batch error:`, error.message);
}
}



function generateUniquePasscode() {
return Math.floor(100000 + Math.random() * 900000).toString();
}



function calculateDistancePoints(miles) {
if (!miles || miles === 0) return 7;
if (miles <= 5) return 15;
if (miles <= 10) return 10;
if (miles <= 20) return 7;
if (miles <= 30) return 5;
if (miles <= 50) return 3;
if (miles <= 100) return -5;
return -10;
}


async function processEmployees(employees, user, inputFileName, recordCount) {
console.log('\n' + '='.repeat(60));
console.log(`[PROCESS START] Total employees to process: ${employees.length}`);
console.log(`[PROCESS START] Input file: ${inputFileName}`);
console.log(`[PROCESS START] Record count: ${recordCount}`);
console.log('='.repeat(60));
const isPreHireUpload = employees.length > 0 && employees[0].isPreHire;
if (!isPreHireUpload) {
await saveFileDataToAirtableInBatch(employees); // ✅ runs once before loop
}
const results = [];

for (const [empIndex, emp] of employees.entries()) {
console.log('\n' + '-'.repeat(50));
console.log(`[EMP ${empIndex + 1}/${employees.length}] Starting processing...`);

try {
let totalCategoryScore = 0;
let validCategories = 0;

let employeeName = emp['Employee Name (Last Suffix, First MI)'] ?
emp['Employee Name (Last Suffix, First MI)'] :
emp['Employee Name (Last Suffix,First MI)'];

if (!employeeName) {
console.log(`[EMP ${empIndex + 1}] ❌ SKIP - No employee name found`);
console.log(`[EMP ${empIndex + 1}] Raw row keys:`, Object.keys(emp));
continue;
}

console.log(`[EMP ${empIndex + 1}] 👤 Name: ${employeeName}`);

let splitName = employeeName?.includes(',') ?
employeeName.split(',') :
employeeName.split(' ');

// "Abernathy, Rita K." → splitName[0]=Last, splitName[1]=First
let lastName, firstName;
if (employeeName.includes(',')) {
lastName = splitName[0].trim();
firstName = splitName[1]?.trim() || '';
} else {
firstName = splitName[0].trim();
lastName = splitName[1]?.trim() || '';
}

let email = emp['E-mail Address'] ? emp['E-mail Address'] : emp['Alternate Email'];
let phone = emp['Home Phone (Formatted)'] || emp['Phone'] || emp['Mobile'] || '';
let companyName = emp['Company Name'] || emp['Company'] || emp['Organization'] || emp['Entity'] || '';

let birth_date = emp['Date of Birth'];
let financeScore = parseFloat(emp['Finance Score (1-10)']) || 0;
let scheduleScore = parseFloat(emp['Schedule Score (1-10)']) || 0;
let wlbScore = parseFloat(emp['Work Life Balance Score (1-10)']) || 0;
let familyScore = parseFloat(emp['Family Score (1-10)']) || 0;



// ─── Duplicate check via MongoDB ───────────s────────────────────
// if (email) {
// const existingRecord = await RetentionData.findOne({ email: email });
// if (existingRecord) {
// console.log(`[EMP ${empIndex + 1}] ⚠️ DUPLICATE - Email already exists in DB: ${email}`);
// await saveIncompleteRecordToAirtable(emp, {
// status: null,
// message: `Duplicate record — email already exists: ${email}`
// }, inputFileName);
// continue;
// }
// }


console.log(`[EMP ${empIndex + 1}] 📋 Data extracted:`);


console.log(`[EMP ${empIndex + 1}] 📋 Data extracted:`);
console.log(` - firstName: "${firstName}", lastName: "${lastName}"`);
console.log(` - email: "${email}"`);
console.log(` - phone: "${phone}"`);
console.log(` - birth_date: "${birth_date}"`);
console.log(` - company: "${companyName}"`);
console.log(` - scores → finance:${financeScore} schedule:${scheduleScore} wlb:${wlbScore} family:${familyScore}`);

if (!birth_date && !emp.isPreHire) {
console.log(`[EMP ${empIndex + 1}] ❌ SKIP - Missing Date of Birth`);
continue;
}
if (!emp.isPreHire && !financeScore && !scheduleScore && !wlbScore && !familyScore) {
console.log(`[EMP ${empIndex + 1}] ❌ SKIP - All social scores are 0/missing`);
continue;
}

// PDL API call
console.log(`[EMP ${empIndex + 1}] 🔍 Calling PDL API...`);
const pdlUrl = `https://api.peopledatalabs.com/v5/person/identify?name=${encodeURIComponent(employeeName)}&first_name=${encodeURIComponent(firstName)}&phone=${encodeURIComponent(phone || '')}&last_name=${encodeURIComponent(lastName)}&email=${encodeURIComponent(email || '')}&company=${encodeURIComponent(companyName || '')}${birth_date ? `&birth_date=${encodeURIComponent(birth_date)}` : ''}&pretty=false&titlecase=false&include_if_matched=false`;

console.log(`[EMP ${empIndex + 1}] PDL URL: ${pdlUrl}`);

const refinedPhone = phone ? "+" + phone.replace(/\D/g, "") : '';

const options = {
method: 'GET',
url: pdlUrl,
headers: {
accept: 'application/json',
'Content-Type': 'application/json',
'X-API-Key': '96daa17b289fb6f8c7bce95a15303c8d29b3e8cf4415e8247a8753008de5331b'
}
};

console.log(`[EMP ${empIndex + 1}] 🔍 Calling PDL API...`);
await sleep(1200);
let data;
try {
data = await axios.request(options);
console.log("pdl DATA")
console.log(JSON.stringify(data.data)) // only the response body, not the full Axios object
console.log(`[EMP ${empIndex + 1}] ✅ PDL Response status: ${data.status}`);
} catch (pdlError) {
const status = pdlError.response?.status;
const message = pdlError.response?.data?.error?.message || pdlError.message;

console.log(`[EMP ${empIndex + 1}] ❌ PDL API error — status: ${status}, message: ${message}`);

// Save to Airtable Incomplete Records
await saveIncompleteRecordToAirtable(emp, {
status: status,
message: message
}, inputFileName, emp.isPreHire);
console.log(`[ENRICHED] isPreHire: ${emp.isPreHire}, status: ${status}, email: ${emp['E-mail Address']}`);
console.log(`[ENRICHED] Will save enriched? ${emp.isPreHire ? 'YES - pre-hire path' : 'NO - not pre-hire'}`);


if (status === 402) {
console.log(`[EMP ${empIndex + 1}] 🚫 PDL quota exceeded. Aborting.`);
break;
}
if (status === 429) {
console.log(`[EMP ${empIndex + 1}] ⏳ Rate limit — skipping and continuing.`);
const defaultResult = createDefaultResult(emp);
results.push(defaultResult);
continue;
}
const defaultResult = createDefaultResult(emp);
results.push(defaultResult);
try {
if (emp.isPreHire) {
await PreHireRetentionData.create(defaultResult);
} else {
await RetentionData.create(defaultResult);
}
} catch (dbError) {
if (dbError.code === 11000) {
console.log(`Duplicate email skipped: ${dbError.message}`);
} else {
console.log(`Error saving default result: ${dbError.message}`);
}

}
continue;


}
// await sleep(1000);
// console.log(`[EMP ${empIndex + 1}] ✅ PDL Response status: ${data.status}`);
// console.log(`[EMP ${empIndex + 1}] PDL matches count: ${data?.data?.matches?.length || 0}`);

// const enrichedProfile = getEnrichedProfile(email);
// console.log(`[EMP ${empIndex + 1}] 🗂 enrichedData lookup for "${email}":`, enrichedProfile);

// if (!enrichedProfile) {
// console.log(`[EMP ${empIndex + 1}] ❌ SKIP - No enrichedData entry found for email`);
// await saveIncompleteRecordToAirtable(emp, {
// noSocialMedia: true,
// message: 'No entry in enrichedData for this email'
// }, inputFileName, emp.isPreHire);
// continue;
// }



// const matchData = {
// linkedin_url: enrichedProfile.linkedin_url || null,
// linkedin_username: enrichedProfile.linkedin_username || null,
// twitter_url: enrichedProfile.twitter_url || null,
// twitter_username: enrichedProfile.twitter_username || null,
// facebook_url: enrichedProfile.facebook_url || null,
// facebook_username: enrichedProfile.facebook_username || null,
// job_title: null,
// profiles: (
// enrichedProfile.linkedin_url ||
// enrichedProfile.twitter_url ||
// enrichedProfile.facebook_url
// ) ? true : null, // keeps the existing `!matchData?.profiles` guard working
// };

// // Fake a PDL-style data object for the saveEnrichedSocialMediaToAirtable call later
// const data = {
// data: {
// matches: [{
// match_score: enrichedProfile.pdl_match_confidence || 0,
// data: matchData
// }]
// }
// };


const matchData = data?.data?.matches[0]?.data;
if (matchData) {
console.log(`[EMP ${empIndex + 1}] PDL match found:`);
console.log(` - linkedin_url: ${matchData.linkedin_url || 'NOT FOUND'}`);
console.log(` - linkedin_username: ${matchData.linkedin_username || 'NOT FOUND'}`);
console.log(` - twitter_url: ${matchData.twitter_url || 'NOT FOUND'}`);
console.log(` - twitter_username: ${matchData.twitter_username || 'NOT FOUND'}`);
console.log(` - facebook_url: ${matchData.facebook_url || 'NOT FOUND'}`);
console.log(` - facebook_username: ${matchData.facebook_username || 'NOT FOUND'}`);
console.log(` - profiles: ${matchData.profiles ? JSON.stringify(matchData.profiles) : 'NONE'}`);
} else {
console.log(`[EMP ${empIndex + 1}] ⚠️ PDL - No match data found`);
}

let twitterUsername = null;
let linkedinUsername = null;
let facebookUsername = null;

if (matchData?.linkedin_username) linkedinUsername = matchData.linkedin_username;
if (matchData?.twitter_username) twitterUsername = matchData.twitter_username;
if (matchData?.facebook_username) facebookUsername = matchData.facebook_username;

if (!matchData?.profiles) {
console.log(`[EMP ${empIndex + 1}] ❌ SKIP - PDL found no social profiles`);


await saveIncompleteRecordToAirtable(emp, {
noSocialMedia: true,
message: 'No social media profiles found'
}, inputFileName, emp.isPreHire);

continue;
}




const socialMedia = {
linkedin_url: matchData?.linkedin_url || null,
linkedin_username: matchData?.linkedin_username || null,
twitter_url: matchData?.twitter_url || null,
twitter_username: twitterUsername || null,
facebook_url: matchData?.facebook_url || null,
facebook_username: facebookUsername || null
};

console.log(`[EMP ${empIndex + 1}] 📡 Social media to scrape:`, JSON.stringify(socialMedia, null, 2));

const hasFacebook = !!(socialMedia.facebook_username);


const { posts: allPosts, rapidApiErrors } = await fetchAllSocialMediaPosts(socialMedia); // CHANGED
console.log(`[EMP ${empIndex + 1}] 📝 Total posts to analyze: ${allPosts.length}`);

if (rapidApiErrors.length > 0) {
for (const apiErr of rapidApiErrors) {
await saveIncompleteRecordToAirtable(emp, {
status: apiErr.status,
message: `RapidAPI ${apiErr.platform} error: ${apiErr.message}`
}, inputFileName, emp.isPreHire);
}
}

if (allPosts.length === 0) {
console.log(`[EMP ${empIndex + 1}] ⚠️ WARNING - No posts found, scores will all be 0`);
}
const categoryScores = {};
let categoriesCount = 0;


for (const [category, keywordMap] of Object.entries(keywordData)) {
let categoryScore = 0;


let keywordsMatched = 0;
let weightedSum = 0;

for (const [phrase, weight] of Object.entries(keywordMap)) {
let totalCount = 0;
for (const post of allPosts) {
// Only skip if it's a reshare FROM a company page, not the employee's own post
const isCompanyReshare = post.reshared === true &&
(post.text?.toLowerCase().includes('prognosticare') &&
post.poster_linkedin_url?.includes('/company/'));
if (isCompanyReshare) continue;
const cleanedText = cleanText(post.text);
const escapedPhrase = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const matches = (cleanedText.match(new RegExp(`\\b${escapedPhrase}\\b`, 'gi')) || []).length;

totalCount += matches;
}
if (totalCount > 0) {
weightedSum += totalCount * weight;
keywordsMatched += totalCount;
}
}

// Normalize to 0-10 scale
const rawScore = keywordsMatched > 0 ? weightedSum / keywordsMatched : 0;
const normalizedScore = Math.min(parseFloat(rawScore.toFixed(2)), 10);

const keyMap = {
'WorkLifeBalance': 'work life',
'Communication': 'family',
'Financial': 'finances',
'Schedule': 'schedule'
};

const frontendKey = keyMap[category] || category.toLowerCase();
categoryScores[frontendKey] = normalizedScore;
totalCategoryScore += normalizedScore;
validCategories++;

}


const nonZeroScores = Object.values(categoryScores).filter(s => s > 0);

const overallScore = nonZeroScores.length > 0
? parseFloat((nonZeroScores.reduce((a, b) => a + b, 0) / nonZeroScores.length).toFixed(2))
: 0;


console.log("data")
console.log(categoryScores)
console.log(overallScore)
let startDateKey = '';
let startDateValue = '';

if (emp['Original Hire']) {
startDateKey = 'original_hire';
startDateValue = emp['Original Hire'];
} else if (emp['Seniority Date']) {
startDateKey = 'seniority_date';
startDateValue = emp['Seniority Date'];
}


const hireDate = emp['Hire Date'] || emp['Last Hire Date'] || '';
const termDate = emp['Term Date'] || emp['Termination Date'] || '';

const agePoints = calculateAgePoints(birth_date);
const tenurePoints = calculateTenurePoints(hireDate);
const turnoverPoints = calculateTurnoverPoints(termDate);


const distanceMiles = parseFloat(emp['Distance (Miles)']) || 0;
const distancePoints = calculateDistancePoints(distanceMiles);
const financePoints = calculateFinancePoints(financeScore);
const schedulePoints = calculateSchedulePoints(scheduleScore);
const wlbPoints = calculateWLBPoints(wlbScore);
const familyPoints = calculateFamilyPoints(familyScore);

const retentionScore = agePoints + distancePoints + tenurePoints + turnoverPoints + financePoints + schedulePoints + wlbPoints + familyPoints;
const rightFitCandidate = calculateRightFit(retentionScore);

let employeeData = {
name: emp['Employee Name (Last Suffix, First MI)'] || 'N/A',
email: emp['E-mail Address'] || 'N/A',
last_hire_date: emp['Last Hire Date'] || emp['Hire Date'] || 'N/A',
job_start: emp['Job Start'] || 'N/A',
termination_date: termDate || 'N/A',
retentionScore,
rightFitCandidate,
termination_reason: emp['Termination Reason'] || 'N/A',
employement_status: emp['Employment Status'] || 'N/A',
date_of_birth: birth_date && birth_date !== 'N/A' ? birth_date : null,
job_title: matchData?.job_title || emp['Job Title'] || emp['Job Class'] || 'N/A',
department: emp['Department'] || 'N/A',
facility: (emp['Facility'] || emp['Entity'] || emp['Subsidiary'] || 'N/A'),
organization: emp['Organization'] || 'N/A',
division: emp['Division'] || 'N/A',
hireDate: hireDate && hireDate !== 'N/A' ? hireDate : null,
termDate: termDate && termDate !== 'N/A' ? termDate : null,
salaryRange: emp['Salary Range'] || 'N/A',
categoryScores: categoryScores || {},
overallScore: overallScore || 0,
phone: phone || 'N/A',
financeScore, scheduleScore, wlbScore, familyScore,
// Points breakdown
agePoints, distancePoints, tenurePoints, turnoverPoints,
financePoints, schedulePoints, wlbPoints, familyPoints,
// Computed
retentionScore,
rightFitCandidate,
socialData: {
linkedin_url: matchData?.linkedin_url || null,
linkedin_username: matchData?.linkedin_username || null,
twitter_url: matchData?.twitter_url || null,
twitter_username: matchData?.twitter_username || null,
facebook_url: matchData?.facebook_url || null,
facebook_username: matchData?.facebook_username || null,
},
};



if (startDateKey) {
employeeData[startDateKey] = startDateValue;
}


results.push(employeeData);

if (emp.isPreHire) {
await PreHireRetentionData.findOneAndUpdate(
{ email: employeeData.email },
employeeData,
{ upsert: true, new: true }
);
} else {
await RetentionData.findOneAndUpdate(
{ email: employeeData.email },
employeeData,
{ upsert: true, new: true }
);
}

// Save enriched social media to Airtable
if (emp.isPreHire) {
await saveEnrichedSocialMediaToAirtable(
employeeData.email,
employeeData.socialData,
data?.data?.matches[0]?.match_score || 0,
true // isPreHire flag
);
} else {
await saveEnrichedSocialMediaToAirtable(
employeeData.email,
employeeData.socialData,
data?.data?.matches[0]?.match_score || 0
);
}


if (emp.isPreHire) {
await savePreHireResultsToAirtable(employeeData, emp);
} else {
await saveStaffResultsToAirtable(employeeData, emp);
}




} catch (e) {
console.log(`Error processing employee: ${e.message}`);
const defaultResult = createDefaultResult(emp);
results.push(defaultResult);
try {
if (emp.isPreHire) {
await PreHireRetentionData.create(defaultResult);
} else {
await RetentionData.create(defaultResult);
}
} catch (dbError) {
console.log(`Error saving default result to database: ${dbError.message}`);
}
}
}

console.log("RESULTS AFTER FAILING")
console.log(results)
const passcode = generateUniquePasscode();

const outputFileName = `/tmp/public/files/output_${Date.now()}.csv`;
const outputPath = await generateOutputFile(results, outputFileName);

// const fileEntry = await filemodel.create({
// file: inputFileName,
// user: user._id || user,
// paid: true,
// passcode: passcode,
// output:outputPath,
// recordCount
// });


return {results,passcode};
}

function createDefaultResult(emp) {
return {
name: emp['Employee Name (Last Suffix, First MI)'] || 'N/A',
email: emp['E-mail Address'] || 'N/A',
last_hire_date: emp['Last Hire Date'] || 'N/A',
job_start: emp['Job Start'] || 'N/A',
termination_date: emp['Termination Date'] || 'N/A',
termination_reason: emp['Termination Reason'] || 'N/A',
employement_status: emp['Employment Status'] || 'N/A',
date_of_birth: emp['Date of Birth'] || 'N/A',
job_title: emp['Job Title'] || 'N/A',
department: emp['Department'] || 'N/A',
facility: (emp['Facility'] || emp['Entity'] || emp['Subsidiary'] || 'N/A'),
phone: emp['Home Phone (Formatted)'] || emp['Phone'] || emp['Mobile'] || 'N/A',

// Engagement scores (flat structure)
'schedule & workload': 0,
'money & compensation': 0,
'job satisfaction': 0,
'family & work-life balance': 0,
'communication & leadership': 0,
'lack of rest': 0,

// Scores and risk assessment
totalScore: 0,
socialData: {
linkedin_url: null,
linkedin_username: null,
twitter_url: null,
twitter_username: null,
facebook_url: null,
facebook_username: null,
},
overallScore: 0,
riskLevel: 'Low',
possibleImprovedScore: 0,

// Nested category scores
categoryScores: {
'schedule & workload': 0,
'money & compensation': 0,
'job satisfaction': 0,
'family & work-life balance': 0,
'communication & leadership': 0,
'lack of rest': 0
},

// Additional fields that might be added conditionally
...(emp['Original Hire'] && { original_hire: emp['Original Hire'] }),
...(emp['Seniority Date'] && { seniority_date: emp['Seniority Date'] })
};
}

function getLast90Days() {
const today = new Date();
const ninetyDaysAgo = new Date(today);
ninetyDaysAgo.setDate(today.getDate() - 90);
return ninetyDaysAgo.toISOString().slice(0, 19).replace('T', ' ');
}






function cleanText(text) {
return text.toLowerCase().replace(/[^\w\s]/gi, '');
}



async function saveStaffResultsToAirtable(employeeData, emp) {
try {
const Airtable = require('airtable');
const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);
const table = base(process.env.AIRTABLE_STAFF_RESULTS_TABLE_ID);

const fields = {
'Employee Name': employeeData.name || '',
'Email': employeeData.email || '',
'Phone': employeeData.phone || '',
'Department': employeeData.department || '',
'Organization': employeeData.organization || '',
'Division': employeeData.division || '',
'Job Title': employeeData.job_title || '',
'Job Class': emp['Job Class'] || '',
'Hire Date': employeeData.hireDate || null,
'Term Date': employeeData.termDate || null,
'Termination Reason': employeeData.termination_reason || '',
'Employment Status': employeeData.employement_status || '',
'Salary Range': employeeData.salaryRange || '',
'Facility': employeeData.facility || '',
'Finance Score': employeeData.financeScore || 0,
'Schedule Score': employeeData.scheduleScore || 0,
'Work Life Balance Score': employeeData.wlbScore || 0,
'Family Score': employeeData.familyScore || 0,
'Distance Miles': parseFloat(emp['Distance (Miles)']) || 0,
'Age Points': employeeData.agePoints || 0,
'Distance Points': employeeData.distancePoints || 0,
'Tenure Points': employeeData.tenurePoints || 0,
'Turnover Points': employeeData.turnoverPoints || 0,
'Finance Points': employeeData.financePoints || 0,
'Schedule Points': employeeData.schedulePoints || 0,
'WLB Points': employeeData.wlbPoints || 0,
'Family Points': employeeData.familyPoints || 0,
'Retention Score': employeeData.retentionScore || 0,
'Right Fit Candidate': employeeData.rightFitCandidate || false,
'Work Life Category Score': employeeData.categoryScores['work life'] || 0,
'Family Category Score': employeeData.categoryScores['family'] || 0,
'Finances Category Score': employeeData.categoryScores['finances'] || 0,
'Schedule Category Score': employeeData.categoryScores['schedule'] || 0,
'Overall Score': employeeData.overallScore || 0,
'Risk Level': determineRiskLevel(employeeData.overallScore),
'Category of Concern': determineCategoryOfConcern(employeeData.categoryScores),
'Processed Date': new Date().toISOString().split('T')[0],
};

// Add date of birth only if present
if (employeeData.date_of_birth) {
fields['Date of Birth'] = employeeData.date_of_birth;
}

const existing = await table.select({
filterByFormula: `{Email} = "${employeeData.email}"`
}).firstPage();

if (existing.length > 0) {
await table.update(existing[0].id, fields);
console.log(`✅ Airtable (Staff Results) updated: ${employeeData.email}`);
} else {
await table.create(fields);
console.log(`✅ Airtable (Staff Results) created: ${employeeData.email}`);
}
} catch (error) {
console.error(`❌ Airtable (Staff Results) error for ${employeeData.email}:`, error.message);
}
}


async function savePreHireResultsToAirtable(employeeData, emp) {
try {
const Airtable = require('airtable');
const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);
const table = base(process.env.AIRTABLE_PREHIRE_RESULTS_TABLE_ID);

const wlScore = parseFloat(employeeData.categoryScores?.['work life'] ?? 0);
const famScore = parseFloat(employeeData.categoryScores?.['family'] ?? 0);
const finScore = parseFloat(employeeData.categoryScores?.['finances'] ?? 0);
const schedScore = parseFloat(employeeData.categoryScores?.['schedule'] ?? 0);
const overall = parseFloat(employeeData.overallScore ?? 0);

console.log(`[AIRTABLE PREHIRE] Saving scores for ${employeeData.email}:`);
console.log(` work life: ${wlScore}, family: ${famScore}, finances: ${finScore}, schedule: ${schedScore}, overall: ${overall}`);

const fields = {
'Candidate Name': employeeData.name || '',
'Email': employeeData.email || '',
'Phone': employeeData.phone || '',
'Address': emp['Address Line 1 + Address Line 2'] || '',
'Department Name': employeeData.department || '',
'Opportunity Title': emp['Job Class'] || '',
'Source Job': emp['Job Code'] || '',
'Work Life Category Score': wlScore,
'Family Category Score': famScore,
'Finances Category Score': finScore,
'Schedule Category Score': schedScore,
'Overall Score': overall,
'Risk Level': determineRiskLevel(employeeData.overallScore),
'Category of Concern': determineCategoryOfConcern(employeeData.categoryScores),
'Retention Score': employeeData.retentionScore || 0,
'Right Fit Candidate': employeeData.rightFitCandidate || false,
'Processed Date': new Date().toISOString().split('T')[0],
};

const existing = await table.select({
filterByFormula: `{Email} = "${employeeData.email}"`
}).firstPage();

if (existing.length > 0) {
await table.update(existing[0].id, fields);
console.log(`✅ Airtable (PreHire Results) updated: ${employeeData.email}`);
} else {
await table.create(fields);
console.log(`✅ Airtable (PreHire Results) created: ${employeeData.email}`);
}
} catch (error) {
console.error(`❌ Airtable (PreHire Results) error for ${employeeData.email}:`, error.message);
}
}



async function saveFileDataToAirtable(emp) {
try {
const Airtable = require('airtable');
const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);
const table = base(process.env.AIRTABLE_FILE_DATA_TABLE_ID);

// Convert MM/DD/YYYY to YYYY-MM-DD for Airtable
function toDate(val) {
if (!val || val === 'N/A' || val === '') return null;
const parts = val.split('/');
if (parts.length === 3) {
return `${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
}
return val;
}

const fields = {
'Employee Name (Last Suffix, First MI)': emp['Employee Name (Last Suffix, First MI)'] || '',
'Address Line 1 + Address Line 2': emp['Address Line 1 + Address Line 2'] || '',
'City, State Zip Code (Formatted)': emp['City, State Zip Code (Formatted)'] || '',
'E-mail Address': emp['E-mail Address'] || '',
'Hire Date': toDate(emp['Hire Date']),
'Term Date': toDate(emp['Term Date']),
'Organization': emp['Organization'] || '',
'Division': emp['Division'] || '',
'Department': emp['Department'] || '',
'Job Class': emp['Job Class'] || '',
'Date of Birth': toDate(emp['Date of Birth']),
'Finance Score (1-10)': parseFloat(emp['Finance Score (1-10)']) || 0,
'Schedule Score (1-10)': parseFloat(emp['Schedule Score (1-10)']) || 0,
'Work Life Balance Score (1-10)': parseFloat(emp['Work Life Balance Score (1-10)']) || 0,
'Family Score (1-10)': parseFloat(emp['Family Score (1-10)']) || 0,
'Distance (Miles)': parseFloat(emp['Distance (Miles)']) || 0,
};

const email = emp['E-mail Address'];
const existing = await table.select({
filterByFormula: `{E-mail Address} = "${email}"`
}).firstPage();

if (existing.length > 0) {
await table.update(existing[0].id, fields);
console.log(`✅ Airtable updated (file data): ${emp['Employee Name (Last Suffix, First MI)']}`);
} else {
await table.create(fields);
console.log(`✅ Airtable created (file data): ${emp['Employee Name (Last Suffix, First MI)']}`);
}
} catch (error) {
console.error(`❌ Airtable error for ${emp['Employee Name (Last Suffix, First MI)']}:`, error.message);
}
}


async function savePreHireFileDataToAirtableInBatch(employees) {
try {
const Airtable = require('airtable');
const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);
const table = base(process.env.AIRTABLE_PREHIRE_EMPLOYEE);

const records = employees.map(emp => ({
fields: {
'Candidate (Last, Suffix First MI)': emp['Candidate (Last, Suffix First MI)'] || '',
'Source Job': emp['Source Job'] || '',
'Opportunity Title': emp['Opportunity Title'] || '',
'Source Job Code': emp['Source Job Code'] || '',
'Department Name': emp['Department Name'] || '',
'Email Address': emp['Email Address'] || '',
'Primary Phone': emp['Primary Phone'] || '',
'Address 1': emp['Address 1'] || '',
'City': emp['City'] || '',
'State/Province Code': emp['State/Province Code'] || '',
'Zip/Postal Code': emp['Zip/Postal Code'] || '',
}
}));

for (let i = 0; i < records.length; i += 10) {
const chunk = records.slice(i, i + 10);
await table.create(chunk);
console.log(`✅ Airtable (PreHire) batch ${i + 1}–${i + chunk.length}`);
}
} catch (error) {
console.error(`❌ Airtable (PreHire) batch error:`, error.message);
}
}


async function savePreHireFileDataToAirtable(emp) {
try {
const Airtable = require('airtable');
const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);
const table = base(process.env.AIRTABLE_PREHIRE_EMPLOYEE);

const fields = {
'Candidate (Last, Suffix First MI)': emp['Candidate (Last, Suffix First MI)'] || '',
'Source Job': emp['Source Job'] || '',
'Opportunity Title': emp['Opportunity Title'] || '',
'Source Job Code': emp['Source Job Code'] || '',
'Department Name': emp['Department Name'] || '',
'Email Address': emp['Email Address'] || '',
'Primary Phone': emp['Primary Phone'] || '',
'Address 1': emp['Address 1'] || '',
'City': emp['City'] || '',
'State/Province Code': emp['State/Province Code'] || '',
'Zip/Postal Code': emp['Zip/Postal Code'] || '',
};

const email = emp['Email Address'];
const existing = await table.select({
filterByFormula: `{Email Address} = "${email}"`
}).firstPage();

if (existing.length > 0) {
await table.update(existing[0].id, fields);
console.log(`✅ Airtable updated (pre-hire): ${emp['Candidate (Last, Suffix First MI)']}`);
} else {
await table.create(fields);
console.log(`✅ Airtable created (pre-hire): ${emp['Candidate (Last, Suffix First MI)']}`);
}
} catch (error) {
console.error(`❌ Airtable error (pre-hire) for ${emp['Candidate (Last, Suffix First MI)']}:`, error.message);
}
}


async function saveIncompleteRecordToAirtable(emp, pdlError, uploadId, isPreHire = false) {
console.log(`\n[INCOMPLETE AIRTABLE] ========== START ==========`);
console.log(`[INCOMPLETE AIRTABLE] isPreHire: ${isPreHire}`);
console.log(`[INCOMPLETE AIRTABLE] uploadId: ${uploadId}`);
console.log(`[INCOMPLETE AIRTABLE] emp keys: ${JSON.stringify(Object.keys(emp))}`);
console.log(`[INCOMPLETE AIRTABLE] pdlError: ${JSON.stringify(pdlError)}`);

try {
const Airtable = require('airtable');
const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);

const tableId = isPreHire
? process.env.AIRTABLE_PREHIRE_ERROR
: process.env.AIRTABLE_INCOMPLETE_TABLE_ID;

console.log(`[INCOMPLETE AIRTABLE] tableId resolved: "${tableId}"`);
console.log(`[INCOMPLETE AIRTABLE] AIRTABLE_PREHIRE_ERROR env: "${process.env.AIRTABLE_PREHIRE_ERROR}"`);
console.log(`[INCOMPLETE AIRTABLE] AIRTABLE_INCOMPLETE_TABLE_ID env: "${process.env.AIRTABLE_INCOMPLETE_TABLE_ID}"`);
console.log(`[INCOMPLETE AIRTABLE] AIRTABLE_BASE_ID env: "${process.env.AIRTABLE_BASE_ID}"`);

if (!tableId) {
console.error(`[INCOMPLETE AIRTABLE] ❌ tableId is undefined/empty — check your .env file`);
return;
}

const table = base(tableId);

function toDate(val) {
if (!val || val === 'N/A' || val === '') return null;
const parts = val.split('/');
if (parts.length === 3) {
return `${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
}
return val;
}

let reason = 'No PDL match found';
let pdlStatus = null;
let errorMessage = '';

if (pdlError) {
pdlStatus = pdlError.status || null;
errorMessage = pdlError.message || '';

if (pdlStatus === 404) {
reason = 'No PDL match found';
} else if (pdlStatus === 402) {
reason = 'PDL API error';
errorMessage = 'Quota exceeded';
} else if (pdlStatus === 429) {
reason = 'PDL API error';
errorMessage = 'Rate limit exceeded';
} else if (pdlError.noSocialMedia) {
reason = 'No social media profiles found';
} else {
reason = 'PDL API error';
}
}

console.log(`[INCOMPLETE AIRTABLE] reason: "${reason}", pdlStatus: ${pdlStatus}`);

const employeeName = emp['Employee Name (Last Suffix, First MI)'] || '';


console.log(`[INCOMPLETE AIRTABLE] employeeName resolved: "${employeeName}"`);
console.log(`[INCOMPLETE AIRTABLE] emp['Candidate (Last, Suffix First MI)']: "${emp['Candidate (Last, Suffix First MI)']}"`);
console.log(`[INCOMPLETE AIRTABLE] emp['Employee Name (Last Suffix, First MI)']: "${emp['Employee Name (Last Suffix, First MI)']}"`);

const nameParts = employeeName.includes(',')
? employeeName.split(',').map(s => s.trim())
: employeeName.split(' ').map(s => s.trim());

const lastName = employeeName.includes(',') ? nameParts[0] : (nameParts[1] || '');
const firstName = employeeName.includes(',') ? (nameParts[1] || '') : nameParts[0];

console.log(`[INCOMPLETE AIRTABLE] firstName: "${firstName}", lastName: "${lastName}"`);

const email = emp['E-mail Address'] || '';
const phone = emp['Home Phone (Formatted)'] || emp['Phone'] || '';
const address = emp['Address Line 1 + Address Line 2'] || '';

console.log(`[INCOMPLETE AIRTABLE] email: "${email}"`);
console.log(`[INCOMPLETE AIRTABLE] phone: "${phone}"`);
console.log(`[INCOMPLETE AIRTABLE] address: "${address}"`);


const fields = {
'client_id': process.env.CLIENT_ID || 'default_client',
'upload_id': uploadId || Date.now().toString(),
'record_id': `REC_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
'first_name': firstName,
'last_name': lastName,
'email': email,
'phone': phone,
'address': address,
'date_of_birth': toDate(emp['Date of Birth']) || '',
'reason': reason,
'pdl_response_status': pdlStatus,
'pdl_error_message': errorMessage,
'date_flagged': new Date().toISOString().split('T')[0],
'review_status': 'Pending Review',
'admin_notes': ''
};

if (isPreHire) {
delete fields['date_of_birth'];
delete fields['admin_notes'];
}
console.log(`[INCOMPLETE AIRTABLE] fields to save: ${JSON.stringify(fields)}`);
console.log(`[INCOMPLETE AIRTABLE] Calling table.create...`);

await table.create(fields);
console.log(`✅ [INCOMPLETE AIRTABLE] SUCCESS (${isPreHire ? 'PreHire' : 'Employee'}): ${employeeName} - Reason: ${reason}`);
} catch (error) {
const nameKey = isPreHire ? 'Candidate (Last, Suffix First MI)' : 'Employee Name (Last Suffix, First MI)';
console.error(`❌ [INCOMPLETE AIRTABLE] CATCH ERROR for ${emp[nameKey]}: ${error.message}`);
console.error(`❌ [INCOMPLETE AIRTABLE] Full error:`, error);
}

console.log(`[INCOMPLETE AIRTABLE] ========== END ==========\n`);
}


async function saveEnrichedSocialMediaToAirtable(email, socialData, matchConfidence, isPreHire = false) {
try {
const Airtable = require('airtable');
const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);
const table = base(isPreHire ? process.env.AIRTABLE_PREHIRE_SOCIAL : process.env.AIRTABLE_ENRICHED_TABLE_ID);

const fields = {
'email': email || '',
'linkedin_url': socialData.linkedin_url || '',
'linkedin_username': socialData.linkedin_username || '',
'facebook_url': socialData.facebook_url || '',
'facebook_username': socialData.facebook_username || '',
'twitter_url': socialData.twitter_url || '',
'twitter_username': socialData.twitter_username || '',
'instagram_url': socialData.instagram_url || '',
'instagram_username': socialData.instagram_username || '',
'enrichment_date': new Date().toISOString().split('T')[0],
'pdl_match_confidence': matchConfidence || 0
};

// Check if email already exists
const existing = await table.select({
filterByFormula: `{email} = "${email}"`
}).firstPage();

if (existing.length > 0) {
await table.update(existing[0].id, fields);
console.log(`✅ Airtable (Enriched) updated: ${email}`);
} else {
await table.create(fields);
console.log(`✅ Airtable (Enriched) created: ${email}`);
}
} catch (error) {
console.error(`❌ Airtable error (Enriched) for ${email}:`, error.message);
}
}


async function processPreHireCandidates(candidates, user, inputFileName, recordCount) {
console.log("PREHIRE YES");

// ─── Save original pre-hire data to Airtable BEFORE mapping ───────
await savePreHireFileDataToAirtableInBatch(candidates);

const mappedCandidates = candidates.map(emp => ({
'Employee Name (Last Suffix, First MI)': emp['Candidate (Last, Suffix First MI)'] || '',
'E-mail Address': emp['Email Address'] || '',
'Home Phone (Formatted)': emp['Primary Phone'] || '',
'Address Line 1 + Address Line 2': `${emp['Address 1'] || ''} ${emp['City'] || ''} ${emp['State/Province Code'] || ''} ${emp['Zip/Postal Code'] || ''}`.trim(),
'Organization': emp['Department Name'] || '',
'Department': emp['Department Name'] || '',
'Job Class': emp['Opportunity Title'] || emp['Source Job'] || '',
'Job Code': emp['Source Job Code'] || '',
'Date of Birth': '',
'Hire Date': '',
'Term Date': '',
'Finance Score (1-10)': 1,
'Schedule Score (1-10)': 1,
'Work Life Balance Score (1-10)': 1,
'Family Score (1-10)': 1,
'Distance (Miles)': 0,
'Division': '',
'Salary Range': '',
isPreHire: true,
}));

return processEmployees(mappedCandidates, user, inputFileName, recordCount);
}



module.exports = { processEmployees, processPreHireCandidates, fetchAllSocialMediaPosts, keywordData, cleanText };