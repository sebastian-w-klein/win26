// The draft pool: 150 real operatives, strategists, and firms, sorted into the
// 21 slots on the card.
//
// The `credit` line on every card is public record — the job they actually held.
// The OVR number and the spec tags are EDITORIAL GAMEPLAY RATINGS invented for
// this game. They are one person's opinion tuned for balance, not a measurement
// of anybody's ability, and nothing here should be read as a factual claim about
// how good someone is at their job.
//
// side:  'D' | 'R' | 'X'  (X = works for whoever is paying)
// lanes: the ideological lanes this pick is a natural fit for
// specs: axis tags  -> union, suburban, latino, black, rural, young, senior
//        unit tags  -> turnout, persuasion, earned-media, small-dollar,
//                      bigmoney, viral, analytics, ops, legal

import { POLLSTER_RATINGS } from './pollster-ratings.js';

const P = [];
const o = (role, name, org, side, lanes, ovr, specs, credit) =>
  P.push({
    id: `${role}:${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`,
    role, name, org, side,
    lanes: lanes ? lanes.split(' ') : [],
    ovr,
    specs: specs ? specs.split(' ') : [],
    credit
  });

/* ── 1. CAMPAIGN MANAGER ────────────────────────────────────────────────── */
o('campaign-manager', "Jen O'Malley Dillon", 'Precision Strategies', 'D', 'liberal-inst abundance-mod', 93, 'turnout suburban', 'Campaign manager, Biden 2020; campaign chair, Harris 2024');
o('campaign-manager', 'Susie Wiles', 'Trump 2024', 'R', 'maga-populist fusionist-con', 94, 'ops rural', "Co-campaign manager, Trump 2024; ran Trump's Florida operation in 2016");
o('campaign-manager', 'Chris LaCivita', 'Trump 2024', 'R', 'maga-populist fusionist-con', 89, 'persuasion rural', 'Co-campaign manager, Trump 2024; strategist for Swift Boat Veterans for Truth in 2004');
o('campaign-manager', 'Jim Messina', 'The Messina Group', 'D', 'liberal-inst abundance-mod', 88, 'analytics bigmoney', 'Campaign manager, Obama 2012');
o('campaign-manager', 'Quentin Fulks', 'Harris 2024', 'D', 'liberal-inst mainstream-prog', 85, 'black turnout', "Principal deputy campaign manager, Harris 2024; campaign manager, Raphael Warnock's 2022 win");
o('campaign-manager', 'Jeff Roe', 'Axiom Strategies', 'R', 'fusionist-con maga-populist', 84, 'turnout analytics', 'Campaign manager, Ted Cruz 2016; led the DeSantis-aligned Never Back Down super PAC');
o('campaign-manager', 'Faiz Shakir', 'More Perfect Union', 'D', 'prog-populist mainstream-prog', 82, 'union small-dollar', 'Campaign manager, Bernie Sanders 2020');

/* ── 2. DEPUTY CAMPAIGN MANAGER ─────────────────────────────────────────── */
o('deputy-cm', 'Rob Flaherty', 'Harris 2024', 'D', 'liberal-inst mainstream-prog', 86, 'viral young', 'Deputy campaign manager, Harris 2024; White House director of digital strategy');
o('deputy-cm', 'Dan Kanninen', 'Harris 2024', 'D', 'liberal-inst abundance-mod', 83, 'turnout ops', 'Battleground states director, Harris 2024; state director, Obama 2012');
o('deputy-cm', 'Justin Clark', 'National Public Affairs', 'R', 'maga-populist fusionist-con', 80, 'legal ops', 'Deputy campaign manager, Trump 2020');
o('deputy-cm', 'Sheila Nix', 'Harris 2024', 'D', 'liberal-inst abundance-mod', 79, 'ops suburban', 'Chief of staff, Harris 2024; chief of staff to First Lady Jill Biden');
o('deputy-cm', 'Ari Rabin-Havt', 'Sanders 2020', 'D', 'prog-populist mainstream-prog', 78, 'union earned-media', 'Deputy campaign manager, Bernie Sanders 2020');
o('deputy-cm', 'Taylor Budowich', 'MAGA Inc.', 'R', 'maga-populist tech-right', 77, 'earned-media viral', 'Trump 2020 spokesman; later chief executive of the MAGA Inc. super PAC');
o('deputy-cm', 'Alex Latcham', 'MAGA Inc.', 'R', 'maga-populist fusionist-con', 76, 'turnout rural', 'Early states director, Trump 2024');

/* ── 3. SENIOR ADVISER ──────────────────────────────────────────────────── */
o('senior-adviser', 'David Plouffe', 'Harris 2024', 'D', 'liberal-inst abundance-mod', 91, 'analytics persuasion', 'Campaign manager, Obama 2008; senior adviser, Harris 2024');
o('senior-adviser', 'Kellyanne Conway', 'KAConsulting', 'R', 'maga-populist fusionist-con', 87, 'earned-media suburban', 'Campaign manager, Trump 2016 — the first woman to run a winning presidential campaign');
o('senior-adviser', 'Anita Dunn', 'SKDK', 'D', 'liberal-inst abundance-mod', 86, 'persuasion bigmoney', 'Senior adviser to President Biden; co-founder of SKDK');
o('senior-adviser', 'Karl Rove', 'Karl Rove & Co.', 'R', 'fusionist-con', 85, 'turnout bigmoney', "Chief strategist for George W. Bush's 2000 and 2004 campaigns");
o('senior-adviser', 'Stephanie Cutter', 'Precision Strategies', 'D', 'liberal-inst abundance-mod', 84, 'earned-media persuasion', 'Deputy campaign manager, Obama 2012');
o('senior-adviser', 'Steve Bannon', 'War Room', 'R', 'maga-populist', 83, 'viral rural', 'Chief executive of the Trump 2016 campaign; White House chief strategist');
o('senior-adviser', 'Nina Turner', 'Our Revolution', 'D', 'prog-populist mainstream-prog', 76, 'black union', 'National co-chair, Bernie Sanders 2020');

/* ── 4. CHIEF STRATEGIST ────────────────────────────────────────────────── */
o('chief-strategist', 'David Axelrod', 'AKPD Message and Media', 'D', 'liberal-inst abundance-mod', 92, 'persuasion earned-media', 'Chief strategist, Obama 2008 and 2012');
o('chief-strategist', 'Mike Donilon', 'Biden 2020', 'D', 'liberal-inst', 85, 'persuasion union', "Chief strategist to Joe Biden across four decades of campaigns");
o('chief-strategist', 'Bill Stepien', 'National Public Affairs', 'R', 'maga-populist fusionist-con', 82, 'turnout analytics', 'Campaign manager, Trump 2020; national field director, Trump 2016');
o('chief-strategist', 'Rebecca Katz', 'New Deal Strategies', 'D', 'prog-populist mainstream-prog', 81, 'viral union', "Lead strategist for John Fetterman's 2022 Senate win");
o('chief-strategist', 'Jeff Weaver', 'Sanders 2020', 'D', 'prog-populist', 80, 'union small-dollar', 'Campaign manager, Bernie Sanders 2016; senior adviser, Sanders 2020');
o('chief-strategist', 'Stuart Stevens', 'The Lincoln Project', 'R', 'fusionist-con abundance-mod', 79, 'persuasion suburban', 'Chief strategist, Mitt Romney 2012; co-founder of The Lincoln Project');
o('chief-strategist', 'Sarah Longwell', 'The Bulwark', 'R', 'fusionist-con abundance-mod', 77, 'suburban persuasion', 'Republican strategist and publisher of The Bulwark; runs a long-running swing-voter focus group project');

/* ── 5. COMMUNICATIONS DIRECTOR ─────────────────────────────────────────── */
o('comms-director', 'Jen Psaki', 'MSNBC', 'D', 'liberal-inst abundance-mod', 87, 'earned-media persuasion', 'White House press secretary under Biden; communications director, Obama White House');
o('comms-director', 'Kate Bedingfield', 'Biden 2020', 'D', 'liberal-inst', 85, 'persuasion suburban', 'Communications director, Biden 2020 and the Biden White House');
o('comms-director', 'SKDK', 'SKDKnickerbocker', 'D', 'liberal-inst mainstream-prog', 83, 'persuasion bigmoney', "Washington's largest Democratic public affairs and campaign communications firm");
o('comms-director', 'Steven Cheung', 'Trump 2024', 'R', 'maga-populist', 82, 'viral earned-media', 'Communications director, Trump 2024');
o('comms-director', 'Michael Tyler', 'Harris 2024', 'D', 'liberal-inst mainstream-prog', 81, 'black earned-media', 'Communications director, Harris 2024; DNC communications director');
o('comms-director', 'Brian Fallon', 'Demand Justice', 'D', 'mainstream-prog prog-populist', 79, 'young persuasion', 'National press secretary, Hillary Clinton 2016; co-founder of Demand Justice');
o('comms-director', 'Tim Murtaugh', 'Trump 2020', 'R', 'maga-populist fusionist-con', 76, 'rural earned-media', 'Communications director, Trump 2020');

/* ── 6. PRESS SECRETARY ─────────────────────────────────────────────────── */
o('press-secretary', 'Karoline Leavitt', 'Trump 2024', 'R', 'maga-populist', 84, 'earned-media viral', 'National press secretary, Trump 2024; White House press secretary');
o('press-secretary', 'Symone Sanders Townsend', 'MSNBC', 'D', 'mainstream-prog prog-populist', 80, 'young black', 'National press secretary, Bernie Sanders 2016; chief spokesperson for Vice President Harris');
o('press-secretary', 'Ian Sams', 'Harris 2020', 'D', 'liberal-inst mainstream-prog', 79, 'persuasion earned-media', 'National press secretary, Kamala Harris 2020; spokesman for the Biden White House counsel');
o('press-secretary', 'Karine Jean-Pierre', 'Biden White House', 'D', 'liberal-inst', 78, 'black persuasion', 'White House press secretary under Biden');
o('press-secretary', 'Andrew Bates', 'Biden White House', 'D', 'liberal-inst', 75, 'persuasion suburban', 'White House deputy press secretary; rapid response director, Biden 2020');
o('press-secretary', 'Hogan Gidley', 'America First Policy Institute', 'R', 'maga-populist fusionist-con', 74, 'rural earned-media', 'National press secretary, Trump 2020; White House principal deputy press secretary');
o('press-secretary', 'Sarah Matthews', 'Independent', 'R', 'fusionist-con abundance-mod', 73, 'suburban earned-media', 'White House deputy press secretary who resigned on January 6 and testified before the House select committee');

/* ── 7. RAPID RESPONSE DIRECTOR ─────────────────────────────────────────── */
o('rapid-response', 'Jason Miller', 'Trump 2024', 'R', 'maga-populist fusionist-con', 80, 'earned-media viral', 'Senior adviser and communications strategist on all three Trump presidential campaigns');
o('rapid-response', 'MAGA War Room', 'Trump-aligned', 'R', 'maga-populist', 80, 'viral rural', 'The Trump-aligned rapid response and video clipping operation');
o('rapid-response', 'Ammar Moussa', 'DNC', 'D', 'liberal-inst mainstream-prog', 79, 'earned-media viral', 'Rapid response director, Biden 2024; DNC rapid response director');
o('rapid-response', 'Media Matters', 'Media Matters for America', 'D', 'mainstream-prog prog-populist', 78, 'viral young', 'The progressive media-monitoring and rapid-response organization');
o('rapid-response', 'Zach Parkinson', 'Trump 2020', 'R', 'maga-populist fusionist-con', 77, 'analytics earned-media', 'Deputy communications director and head of research, Trump 2020');
o('rapid-response', 'Adrienne Elrod', 'Harris 2024', 'D', 'liberal-inst abundance-mod', 77, 'earned-media suburban', 'Senior spokesperson, Harris 2024; director of strategic communications, Clinton 2016');
o('rapid-response', 'Matt Corridoni', 'DNC', 'D', 'liberal-inst mainstream-prog', 72, 'earned-media persuasion', 'Democratic rapid response operative; DNC war room');

/* ── 8. DIGITAL DIRECTOR ────────────────────────────────────────────────── */
o('digital-director', 'Gary Coby', 'Launchpad Strategies', 'R', 'maga-populist tech-right', 90, 'viral small-dollar', 'Digital director for the Trump campaign in 2016, 2020 and 2024');
o('digital-director', 'Bully Pulpit International', 'BPI', 'D', 'liberal-inst abundance-mod', 85, 'analytics persuasion', 'The Democratic digital and paid-media agency founded by Obama 2008 alumni');
o('digital-director', 'Targeted Victory', 'Targeted Victory', 'R', 'fusionist-con maga-populist', 84, 'small-dollar analytics', 'The largest Republican digital fundraising and advertising firm');
o('digital-director', 'Betsy Hoover', 'Higher Ground Labs', 'D', 'mainstream-prog liberal-inst', 83, 'turnout young', 'Director of digital organizing, Obama 2012; co-founder of Higher Ground Labs');
o('digital-director', 'Brad Parscale', 'Trump 2020', 'R', 'maga-populist tech-right', 81, 'analytics rural', 'Digital director, Trump 2016; campaign manager, Trump 2020');
o('digital-director', 'Middle Seat', 'Middle Seat Consulting', 'D', 'prog-populist mainstream-prog', 79, 'small-dollar young', 'The progressive digital firm that grew out of the Sanders small-dollar operation');
o('digital-director', 'Authentic Campaigns', 'Authentic', 'D', 'mainstream-prog liberal-inst', 77, 'viral turnout', 'Democratic digital advertising and organizing agency');

/* ── 9. NEW MEDIA DIRECTOR ──────────────────────────────────────────────── */
o('new-media-director', 'Alex Bruesewitz', 'X Strategies', 'R', 'maga-populist tech-right', 84, 'viral young', "Founder of X Strategies; helped build Trump 2024's podcast and online-influencer strategy");
o('new-media-director', 'Jon Favreau', 'Crooked Media', 'D', 'liberal-inst mainstream-prog', 83, 'young persuasion', 'Head speechwriter for Obama; co-founder of Crooked Media and Pod Save America');
o('new-media-director', 'Annie Wu Henry', 'Independent', 'D', 'prog-populist mainstream-prog', 82, 'viral young', "The digital strategist behind John Fetterman's 2022 social media operation");
o('new-media-director', 'Aidan Kohn-Murphy', 'Gen-Z for Change', 'D', 'mainstream-prog prog-populist', 78, 'young viral', 'Founder of Gen-Z for Change');
o('new-media-director', 'Keith Edwards', 'Independent', 'D', 'mainstream-prog liberal-inst', 76, 'viral persuasion', 'Democratic content creator and messaging strategist');
o('new-media-director', 'Courier Newsroom', 'Courier', 'D', 'liberal-inst mainstream-prog', 74, 'rural persuasion', 'The progressive local-news network built to reach voters in swing states');
o('new-media-director', 'Rachel Janfaza', 'The Up and Up', 'X', 'mainstream-prog tech-right', 72, 'young analytics', 'Founder of The Up and Up, covering youth political behavior');

/* ── 10. PAID MEDIA SPECIALIST ──────────────────────────────────────────── */
o('paid-media', 'GMMB', 'GMMB', 'D', 'liberal-inst abundance-mod', 88, 'persuasion suburban', 'The Democratic ad firm behind Obama 2008 and 2012');
o('paid-media', 'Jim Margolis', 'GMMB', 'D', 'liberal-inst', 85, 'persuasion senior', 'Media adviser to Obama 2008 and 2012 and to Clinton 2016');
o('paid-media', 'National Media', 'National Media Research, Planning & Placement', 'R', 'fusionist-con maga-populist', 84, 'bigmoney senior', 'The major Republican ad research and placement firm');
o('paid-media', 'Mark Putnam', 'Putnam Partners', 'D', 'liberal-inst abundance-mod', 83, 'persuasion rural', 'Lead ad maker for Biden 2020');
o('paid-media', 'Assemble The Agency', 'Assemble', 'D', 'liberal-inst mainstream-prog', 82, 'bigmoney persuasion', "The media agency at the center of Harris 2024's paid program");
o('paid-media', 'Convergence Media', 'Convergence', 'R', 'maga-populist tech-right', 78, 'rural viral', "The Republican firm that handled Trump 2020's ad placement");
o('paid-media', 'Canal Partners Media', 'Canal Partners', 'D', 'liberal-inst mainstream-prog', 76, 'bigmoney suburban', 'Democratic media-buying firm');

/* ── 11. CREATIVE DIRECTOR ──────────────────────────────────────────────── */
o('creative-director', 'Devine Mulvey Longabaugh', 'DML', 'D', 'prog-populist mainstream-prog', 82, 'union viral', "The ad firm behind Bernie Sanders' 2016 and 2020 spots");
o('creative-director', 'Fred Davis', 'Strategic Perception', 'R', 'fusionist-con libertarian-r', 80, 'viral persuasion', 'Republican ad maker behind some of the most-discussed spots of the last two decades');
o('creative-director', 'Lucas Baiano', 'Baiano Studios', 'X', 'maga-populist abundance-mod tech-right', 79, 'viral young', 'Political filmmaker known for cinematic campaign launch videos');
o('creative-director', 'Do Big Things', 'Do Big Things', 'D', 'mainstream-prog prog-populist', 78, 'viral young', 'Progressive creative agency known for viral campaign video');
o('creative-director', 'Something Else Strategies', 'Something Else', 'R', 'fusionist-con abundance-mod', 76, 'suburban persuasion', 'Republican creative and media placement firm');
o('creative-director', 'Wide Eye', 'Wide Eye Creative', 'D', 'mainstream-prog abundance-mod', 75, 'young suburban', 'Democratic brand and creative studio');
o('creative-director', 'Jimmy Siegel', 'Siegel Strategies', 'D', 'liberal-inst', 74, 'persuasion senior', 'Democratic ad maker whose spots have run for Obama and a generation of statewide candidates');

/* ── 12. NATIONAL FIELD DIRECTOR ────────────────────────────────────────── */
o('national-field', 'Jeremy Bird', '270 Strategies', 'D', 'liberal-inst mainstream-prog', 91, 'turnout black', 'National field director, Obama 2012; co-founder of 270 Strategies');
o('national-field', 'Marlon Marshall', 'Harris 2024', 'D', 'liberal-inst mainstream-prog', 86, 'turnout black', 'Deputy national field director, Obama 2012; director of state campaigns, Clinton 2016');
o('national-field', 'Mitch Stewart', '270 Strategies', 'D', 'liberal-inst abundance-mod', 84, 'turnout rural', 'Battleground states director, Obama 2012; co-founder of 270 Strategies');
o('national-field', 'Emmy Ruiz', 'Biden White House', 'D', 'liberal-inst mainstream-prog', 83, 'latino turnout', 'Nevada and Colorado state director, Clinton 2016; White House political director');
o('national-field', 'Turning Point Action', 'TPAction', 'R', 'maga-populist', 82, 'rural turnout', 'The organization that ran a large paid Republican turnout program in 2024');
o('national-field', 'Claire Sandberg', 'Sanders 2020', 'D', 'prog-populist mainstream-prog', 79, 'young union', 'National organizing director, Bernie Sanders 2020');
o('national-field', 'America PAC', 'America PAC', 'R', 'tech-right maga-populist', 78, 'bigmoney rural', 'The outside group that took over much of the Republican canvassing operation in 2024');

/* ── 13. DEPUTY FIELD DIRECTOR ──────────────────────────────────────────── */
o('deputy-field', 'Culinary Union Local 226', 'UNITE HERE', 'D', 'prog-populist liberal-inst', 81, 'latino union', "Nevada's hotel workers union, whose door program decides the state");
o('deputy-field', 'Brendan McPhillips', 'Biden 2020', 'D', 'liberal-inst mainstream-prog', 80, 'turnout union', 'Pennsylvania state director, Biden 2020');
o('deputy-field', 'Faith & Freedom Coalition', 'Faith & Freedom', 'R', 'fusionist-con maga-populist', 79, 'rural senior', 'The evangelical voter-contact organization founded by Ralph Reed');
o('deputy-field', 'Working Families Party', 'WFP', 'D', 'prog-populist mainstream-prog', 78, 'union black', 'The progressive party organization and its canvassing operation');
o('deputy-field', 'Rebecca Pearcey', 'Warren 2020', 'D', 'mainstream-prog prog-populist', 76, 'turnout suburban', 'Political director, Elizabeth Warren 2020');
o('deputy-field', 'NextGen America', 'NextGen', 'D', 'mainstream-prog prog-populist', 74, 'young turnout', 'The youth registration and turnout organization');
o('deputy-field', 'Nick Trainer', 'Trump 2020', 'R', 'maga-populist fusionist-con', 73, 'rural turnout', 'Director of battleground strategy, Trump 2020');

/* ── 14. POLITICAL DIRECTOR ─────────────────────────────────────────────── */
o('political-director', 'SEIU', 'Service Employees International Union', 'D', 'prog-populist mainstream-prog', 85, 'latino union', 'The service workers union and one of the largest independent-expenditure operations on the left');
o('political-director', 'AFL-CIO', 'AFL-CIO', 'D', 'prog-populist liberal-inst', 83, 'union rural', 'The labor federation whose member-to-member program is the oldest field program in American politics');
o('political-director', 'Cedric Richmond', 'DNC', 'D', 'liberal-inst mainstream-prog', 82, 'black bigmoney', 'National co-chair, Biden 2020; senior adviser in the Biden White House');
o('political-director', 'EMILYs List', 'EMILYs List', 'D', 'liberal-inst mainstream-prog', 81, 'suburban bigmoney', 'The organization that recruits and funds Democratic women candidates');
o('political-director', 'Club for Growth', 'Club for Growth', 'R', 'fusionist-con libertarian-r', 80, 'bigmoney rural', 'The anti-tax group that funds Republican primaries and general elections');
o('political-director', 'Chris Carr', 'RNC', 'R', 'maga-populist fusionist-con', 79, 'turnout rural', 'Political director, Trump 2020; RNC political director');
o('political-director', 'Analilia Mejia', 'Sanders 2020', 'D', 'prog-populist mainstream-prog', 75, 'union latino', 'National political director, Bernie Sanders 2020');
o('political-director', 'National Rifle Association', 'NRA', 'R', 'fusionist-con libertarian-r', 74, 'rural senior', 'The gun-rights organization and its member mobilization program');

/* ── 15. FINANCE DIRECTOR ───────────────────────────────────────────────── */
o('finance-director', 'ActBlue', 'ActBlue', 'D', 'prog-populist mainstream-prog liberal-inst abundance-mod', 90, 'small-dollar young', 'The Democratic small-dollar fundraising platform');
o('finance-director', 'Rufus Gifford', 'Biden 2020', 'D', 'liberal-inst abundance-mod', 87, 'bigmoney suburban', 'National finance director, Obama 2012; campaign finance chair, Biden 2020');
o('finance-director', 'WinRed', 'WinRed', 'R', 'maga-populist fusionist-con tech-right libertarian-r', 85, 'small-dollar rural', 'The Republican small-dollar fundraising platform');
o('finance-director', 'Meredith O\'Rourke', 'Trump 2024', 'R', 'maga-populist fusionist-con', 83, 'bigmoney senior', 'National finance director, Trump 2024');
o('finance-director', 'Katie Petrelius', 'Biden 2020', 'D', 'liberal-inst abundance-mod', 80, 'bigmoney suburban', 'Finance director, Biden 2020');
o('finance-director', 'Chris Korge', 'DNC', 'D', 'liberal-inst', 76, 'bigmoney latino', 'National finance chair of the Democratic National Committee');
o('finance-director', 'Mothership Strategies', 'Mothership', 'D', 'mainstream-prog prog-populist', 74, 'small-dollar senior', 'The Democratic digital fundraising firm known for aggressive email and text programs');
o('finance-director', 'Todd Ricketts', 'RNC', 'R', 'fusionist-con', 75, 'bigmoney senior', 'Finance chair of the Republican National Committee');

/* ── 16. OPERATIONS DIRECTOR ────────────────────────────────────────────── */
o('operations-director', 'Katie Walsh Shields', 'RNC', 'R', 'fusionist-con maga-populist', 82, 'ops bigmoney', 'RNC chief of staff through the 2016 cycle; White House deputy chief of staff');
o('operations-director', 'Jenn Ridder', 'Biden 2020', 'D', 'liberal-inst mainstream-prog', 79, 'ops turnout', 'National states director, Biden 2020');
o('operations-director', 'Sean Cairncross', 'RNC', 'R', 'fusionist-con abundance-mod', 77, 'ops bigmoney', 'Chief operating officer of the Republican National Committee');
o('operations-director', 'Richard Walters', 'RNC', 'R', 'maga-populist fusionist-con', 75, 'ops rural', 'Chief of staff of the Republican National Committee');
o('operations-director', 'Greg Schultz', 'Biden 2020', 'D', 'liberal-inst abundance-mod', 74, 'ops rural', 'Campaign manager for Biden 2020 through the primary; longtime Ohio operative');
o('operations-director', 'The Management Center', 'TMC', 'D', 'mainstream-prog liberal-inst', 73, 'ops turnout', 'The organization that trains progressive campaign and advocacy managers');
o('operations-director', 'Arena', 'Arena', 'D', 'mainstream-prog prog-populist', 72, 'ops young', 'The organization that recruits and trains Democratic campaign staff');

/* ── 17. POLICY DIRECTOR ────────────────────────────────────────────────── */
o('policy-director', 'Brian Deese', 'MIT', 'D', 'abundance-mod liberal-inst', 88, 'persuasion suburban', 'Director of the National Economic Council under Biden; architect of the Inflation Reduction Act');
o('policy-director', 'The Heritage Foundation', 'Heritage', 'R', 'fusionist-con maga-populist', 83, 'rural senior', 'The conservative think tank that assembled Project 2025');
o('policy-director', 'Warren Gunnels', 'Sanders staff', 'D', 'prog-populist mainstream-prog', 82, 'union small-dollar', "Bernie Sanders' longtime staff director and policy lead");
o('policy-director', 'Center for American Progress', 'CAP', 'D', 'liberal-inst mainstream-prog', 81, 'suburban black', 'The flagship Democratic policy shop and personnel pipeline');
o('policy-director', 'American Compass', 'American Compass', 'R', 'maga-populist fusionist-con', 80, 'union rural', 'The think tank building a pro-worker conservative economic agenda');
o('policy-director', 'Bharat Ramamurti', 'Roosevelt Institute', 'D', 'mainstream-prog prog-populist', 79, 'young persuasion', 'Deputy director of the National Economic Council; former Elizabeth Warren aide');
o('policy-director', 'Stef Feldman', 'Biden 2020', 'D', 'liberal-inst abundance-mod', 78, 'persuasion suburban', 'National policy director, Biden 2020');
o('policy-director', 'Niskanen Center', 'Niskanen', 'X', 'libertarian-r abundance-mod tech-right', 74, 'suburban persuasion', 'The center-right think tank pushing state-capacity and permitting reform');

/* ── 18. RESEARCH DIRECTOR ──────────────────────────────────────────────── */
o('research-director', 'American Bridge 21st Century', 'American Bridge', 'D', 'liberal-inst mainstream-prog', 88, 'analytics persuasion', "The Democratic Party's principal opposition research and tracking super PAC");
o('research-director', 'America Rising', 'America Rising', 'R', 'fusionist-con maga-populist', 82, 'analytics persuasion', 'The Republican opposition research and tracking operation');
o('research-director', 'Fusion GPS', 'Fusion GPS', 'X', 'liberal-inst fusionist-con', 79, 'analytics earned-media', 'The commercial research firm behind some of the most consequential political dossiers of the era');
o('research-director', 'Tim Miller', 'The Bulwark', 'R', 'fusionist-con abundance-mod', 78, 'analytics earned-media', 'Communications director for Jeb Bush 2016; former executive director of America Rising');
o('research-director', 'DNC Research', 'Democratic National Committee', 'D', 'liberal-inst mainstream-prog', 76, 'analytics turnout', 'The standing research department of the Democratic National Committee');
o('research-director', 'Delve', 'Delve', 'R', 'fusionist-con libertarian-r', 75, 'analytics bigmoney', 'The Republican corporate and political research firm');
o('research-director', 'Lauren Dillon', 'DNC', 'D', 'liberal-inst mainstream-prog', 74, 'analytics suburban', 'Research director of the Democratic National Committee in the 2016 cycle');

/* ── 19. DATA DIRECTOR ──────────────────────────────────────────────────── */
o('data-director', 'Dan Wagner', 'Civis Analytics', 'D', 'liberal-inst abundance-mod', 89, 'analytics turnout', 'Chief analytics officer, Obama 2012; founder of Civis Analytics');
o('data-director', 'Catalist', 'Catalist', 'D', 'prog-populist mainstream-prog liberal-inst abundance-mod', 85, 'analytics black', 'The Democratic voter-file and analytics cooperative');
o('data-director', 'Becca Siegel', 'Biden 2020', 'D', 'liberal-inst mainstream-prog', 84, 'analytics persuasion', 'Chief analytics officer, Biden 2020');
o('data-director', 'i360', 'i360', 'R', 'libertarian-r fusionist-con tech-right', 83, 'analytics rural', 'The Koch-network Republican voter data platform');
o('data-director', 'Elan Kriegel', 'BlueLabs', 'D', 'liberal-inst abundance-mod', 82, 'analytics suburban', 'Analytics director, Clinton 2016; co-founder of BlueLabs');
o('data-director', 'Data Trust', 'Data Trust', 'R', 'fusionist-con maga-populist', 81, 'analytics turnout', "The Republican Party's national voter file company");
o('data-director', 'TargetSmart', 'TargetSmart', 'D', 'liberal-inst mainstream-prog', 79, 'analytics young', 'Democratic voter data and targeting firm');
o('data-director', 'Echelon Insights', 'Echelon', 'R', 'fusionist-con tech-right', 78, 'analytics latino', 'The Republican data and polling firm co-founded by Patrick Ruffini and Kristen Soltis Anderson');

/* ── 20. CHIEF POLLSTER ───────────────────────────────────────────────────
 * The one slot with real published numbers behind it. Every card names a firm
 * in the Silver Bulletin ratings; OVR comes from that firm's rating rather
 * than an editorial guess, and each card carries the firm's grade, poll count
 * and house bias. `pl(firm, ...)` takes the OVR from the ratings table; `adj`
 * marks a named partner as a notch below the shop itself.
 */
const pl = (name, org, side, lanes, firm, specs, credit, adj = 0) => {
  const r = POLLSTER_RATINGS[firm];
  if (!r) throw new Error(`no Silver Bulletin rating for ${firm}`);
  o('chief-pollster', name, org, side, lanes, r.ovr + adj, specs, credit);
  P.at(-1).firm = firm;
};

/* Democratic */
pl('John Anzalone', 'Impact Research', 'D', 'liberal-inst abundance-mod labor-liberal', 'Impact Research', 'rural persuasion', 'Lead pollster for Obama 2012 and Biden 2020');
pl('Geoff Garin', 'Hart Research', 'D', 'liberal-inst mainstream-prog multiracial-coalition', 'Garin-Hart-Yang Research Group', 'analytics suburban', 'President of Hart Research; lead pollster for Harris 2024');
pl('GQR', 'Greenberg Quinlan Rosner', 'D', 'liberal-inst mainstream-prog labor-liberal', 'Greenberg Quinlan Rosner', 'analytics union', 'The Democratic polling firm founded by Stan Greenberg, pollster to Bill Clinton in 1992');
pl('Anna Greenberg', 'GQR', 'D', 'mainstream-prog liberal-inst multiracial-coalition', 'Greenberg Quinlan Rosner', 'suburban young', 'Senior vice president of GQR Research', -2);
pl('Celinda Lake', 'Lake Research Partners', 'D', 'prog-populist liberal-inst labor-liberal', 'Lake Research Partners', 'union senior', 'Co-lead pollster for Biden 2020');
pl('Cornell Belcher', 'brilliant corners', 'D', 'multiracial-coalition liberal-inst', 'brilliant corners Research & Strategies', 'black analytics', 'Pollster for Obama 2008 and 2012');
pl('GBAO', 'GBAO Strategies', 'D', 'labor-liberal mainstream-prog liberal-inst', 'GBAO', 'union turnout', 'The Democratic polling firm behind a long run of Senate campaigns and Navigator Research');
pl('Molly Murphy', 'Impact Research', 'D', 'liberal-inst abundance-mod', 'Impact Research', 'suburban analytics', 'President of Impact Research; pollster for the Biden and Harris campaigns', -1);
pl('Jefrey Pollock', 'Global Strategy Group', 'D', 'abundance-mod liberal-inst multiracial-coalition', 'Global Strategy Group', 'suburban latino', 'President of Global Strategy Group');
pl('David Binder', 'David Binder Research', 'D', 'liberal-inst abundance-mod', 'David Binder Research', 'persuasion analytics', 'Focus group and polling lead for Obama and Biden 2020');
pl('Ben Tulchin', 'Tulchin Research', 'D', 'prog-populist mainstream-prog labor-liberal', 'Tulchin Research', 'young union', 'Pollster for Bernie Sanders 2016 and 2020');
pl('Data for Progress', 'Data for Progress', 'D', 'prog-populist mainstream-prog', 'Data for Progress', 'young analytics', 'The progressive polling and policy shop');
pl('Change Research', 'Change Research', 'D', 'mainstream-prog prog-populist', 'Change Research', 'young turnout', 'Democratic online polling firm built for low-cost, high-frequency tracking');

/* Republican */
pl('Tony Fabrizio', 'Fabrizio Ward', 'R', 'maga-populist fusionist-con', 'Fabrizio, Lee & Associates', 'rural analytics', "Trump's lead pollster in 2016, 2020 and 2024");
pl('Cygnal', 'Cygnal', 'R', 'fusionist-con maga-populist security-hawk', 'Cygnal', 'analytics rural', 'Republican polling and analytics firm with one of the strongest recent public track records');
pl('Public Opinion Strategies', 'Public Opinion Strategies', 'R', 'fusionist-con security-hawk', 'Public Opinion Strategies', 'analytics suburban', 'The largest Republican polling firm, in business since 1991');
pl('Kristen Soltis Anderson', 'Echelon Insights', 'R', 'fusionist-con tech-right abundance-mod security-hawk', 'Echelon Insights', 'young suburban', 'Republican pollster and co-founder of Echelon Insights');
pl('Susquehanna Polling & Research', 'Susquehanna', 'R', 'maga-populist fusionist-con', 'Susquehanna Polling & Research Inc.', 'rural senior', 'Pennsylvania-based Republican polling firm');
pl('Glen Bolger', 'Public Opinion Strategies', 'R', 'fusionist-con security-hawk', 'Public Opinion Strategies', 'analytics senior', 'Co-founder of Public Opinion Strategies', -2);
pl('Tarrance Group', 'The Tarrance Group', 'R', 'fusionist-con security-hawk', 'Tarrance Group', 'analytics senior', 'Longstanding Republican survey research firm');
pl('Chris Wilson', 'WPA Intelligence', 'R', 'fusionist-con social-conservative', 'WPA Intelligence', 'analytics rural', 'Pollster, Ted Cruz 2016; chief executive of WPA Intelligence');
pl('Whit Ayres', 'North Star Opinion Research', 'R', 'security-hawk fusionist-con', 'North Star Opinion Research', 'suburban latino', 'Pollster for Marco Rubio and a leading Republican voice on demographic change');
pl('Adam Geller', 'National Research Inc.', 'R', 'maga-populist social-conservative', 'National Research', 'rural analytics', 'Pollster, Trump 2016');
pl('co/efficient', 'co/efficient', 'R', 'maga-populist libertarian-r', 'co/efficient', 'rural viral', 'Republican firm that polls aggressively in low-cost, high-volume batches');
pl('Meeting Street Insights', 'Meeting Street', 'R', 'fusionist-con social-conservative', 'Meeting Street Insights', 'senior rural', 'Republican survey research firm founded by Neil Newhouse alumni');
pl('McLaughlin & Associates', 'McLaughlin & Associates', 'R', 'maga-populist social-conservative', 'McLaughlin & Associates', 'rural latino', 'A Trump campaign pollster across multiple cycles');

/* ── 21. GENERAL COUNSEL ────────────────────────────────────────────────── */
o('general-counsel', 'Marc Elias', 'Elias Law Group', 'D', 'prog-populist mainstream-prog liberal-inst abundance-mod', 92, 'legal analytics', "The Democratic Party's principal election lawyer");
o('general-counsel', 'Bob Bauer', 'NYU Law', 'D', 'liberal-inst abundance-mod', 87, 'legal persuasion', 'White House counsel under Obama; personal counsel to Joe Biden');
o('general-counsel', 'Charlie Spies', 'Dickinson Wright', 'R', 'fusionist-con abundance-mod', 84, 'legal bigmoney', 'Republican campaign finance lawyer and counsel to the RNC and multiple presidential campaigns');
o('general-counsel', 'Perkins Coie', 'Perkins Coie', 'D', 'liberal-inst abundance-mod', 83, 'legal bigmoney', 'The firm whose political law group represented Democratic presidential campaigns for decades');
o('general-counsel', 'Jones Day', 'Jones Day', 'R', 'maga-populist fusionist-con', 82, 'legal bigmoney', 'The firm that served as principal outside counsel to the Trump campaign');
o('general-counsel', 'Consovoy McCarthy', 'Consovoy McCarthy', 'R', 'fusionist-con libertarian-r', 81, 'legal suburban', 'The conservative litigation boutique behind major election and civil rights cases');
o('general-counsel', 'Cleta Mitchell', 'Election Integrity Network', 'R', 'maga-populist fusionist-con', 80, 'legal rural', 'Conservative election lawyer who leads the Election Integrity Network');
o('general-counsel', 'Dana Remus', 'Biden 2020', 'D', 'liberal-inst mainstream-prog', 79, 'legal ops', 'General counsel of the Biden 2020 campaign; White House counsel');

/* ── depth picks (keeps every slot draftable for a full six-war-room league) ── */
o('comms-director', 'Danielle Alvarez', 'Trump 2024', 'R', 'maga-populist fusionist-con', 78, 'latino earned-media', 'Senior adviser for communications, Trump 2024; RNC communications director');
o('new-media-director', 'Dan Scavino', 'Trump 2024', 'R', 'maga-populist tech-right', 81, 'viral rural', "Trump's longtime social media director; White House deputy chief of staff for communications");
o('new-media-director', 'The Daily Wire', 'Daily Wire', 'R', 'fusionist-con tech-right maga-populist', 77, 'young viral', 'The conservative media company whose shows double as a distribution network');
o('paid-media', 'Jamestown Associates', 'Jamestown', 'R', 'maga-populist fusionist-con', 80, 'rural persuasion', 'The Republican ad firm behind much of the Trump 2020 paid program');
o('creative-director', 'Poolhouse', 'Poolhouse', 'R', 'fusionist-con abundance-mod tech-right', 79, 'suburban viral', "The Republican creative agency behind Glenn Youngkin's 2021 campaign");
o('national-field', 'Americans for Prosperity', 'AFP', 'R', 'libertarian-r fusionist-con', 80, 'rural turnout', "The Koch network's grassroots field and door-knocking organization");
o('deputy-field', 'Sentinel Action Fund', 'Sentinel', 'R', 'fusionist-con maga-populist', 75, 'rural senior', 'The Heritage-aligned super PAC running conservative ground operations in battleground states');
o('deputy-field', 'RNC Ground Game', 'Republican National Committee', 'R', 'fusionist-con maga-populist', 74, 'rural turnout', 'The standing Republican National Committee field and voter-contact program');

/* ══════════════════════════════════════════════════════════════════════════
 * DEPTH FOR A TWELVE-SEAT LEAGUE
 * High-impact slots (campaign manager, chief strategist, national field,
 * comms, digital, pollster, paid media, political director) go 12+ deep in
 * real names. Lower-weight slots get a shorter bench and lean on free agents.
 * ══════════════════════════════════════════════════════════════════════════ */

/* campaign manager */
o('campaign-manager', 'Robby Mook', 'Clinton 2016', 'D', 'liberal-inst abundance-mod', 84, 'analytics suburban', 'Campaign manager, Hillary Clinton 2016');
o('campaign-manager', 'Julie Chávez Rodríguez', 'Biden-Harris 2024', 'D', 'liberal-inst multiracial-coalition', 80, 'latino ops', 'Campaign manager, Biden-Harris 2024');
o('campaign-manager', 'Addisu Demissie', 'Booker 2020', 'D', 'multiracial-coalition mainstream-prog', 79, 'black turnout', "Campaign manager, Cory Booker 2020; managed Gavin Newsom's 2018 win");
o('campaign-manager', 'Roger Lau', 'Warren 2020', 'D', 'mainstream-prog prog-populist', 78, 'ops small-dollar', 'Campaign manager, Elizabeth Warren 2020; DNC deputy executive director');
o('campaign-manager', 'Nick Ayers', 'Pence', 'R', 'fusionist-con social-conservative', 79, 'bigmoney ops', "Chief of staff to Vice President Pence; managed Sonny Perdue's 2010 win");
o('campaign-manager', 'Danny Diaz', 'Jeb Bush 2016', 'R', 'fusionist-con security-hawk', 77, 'earned-media ops', 'Campaign manager, Jeb Bush 2016');
o('campaign-manager', 'Corey Lewandowski', 'Trump 2016', 'R', 'maga-populist', 74, 'rural earned-media', 'Campaign manager, Trump 2016, through the primaries');
o('campaign-manager', 'Generra Peck', 'DeSantis 2024', 'R', 'fusionist-con social-conservative', 72, 'ops suburban', 'Campaign manager, Ron DeSantis 2024');

/* deputy campaign manager */
o('deputy-cm', 'James Blair', 'Trump 2024', 'R', 'maga-populist fusionist-con', 82, 'turnout analytics', 'Political director, Trump 2024; White House deputy chief of staff');
o('deputy-cm', 'Molly Ritner', 'Biden 2020', 'D', 'liberal-inst labor-liberal', 76, 'ops turnout', 'Deputy campaign manager, Biden 2020');
o('deputy-cm', "Jess O'Connell", 'DNC', 'D', 'liberal-inst mainstream-prog', 75, 'ops suburban', 'Chief executive of the Democratic National Committee; EMILYs List');

/* senior adviser */
o('senior-adviser', 'Dan Pfeiffer', 'Crooked Media', 'D', 'liberal-inst mainstream-prog', 82, 'earned-media viral', 'Senior adviser to President Obama; co-host of Pod Save America');
o('senior-adviser', 'Valerie Jarrett', 'Obama Foundation', 'D', 'liberal-inst multiracial-coalition', 80, 'black bigmoney', 'Senior adviser to President Obama across both terms');
o('senior-adviser', 'Hope Hicks', 'Trump 2016', 'R', 'maga-populist', 79, 'earned-media ops', 'Press secretary, Trump 2016; White House counselor');
o('senior-adviser', 'Jared Kushner', 'Trump 2020', 'R', 'maga-populist tech-right', 78, 'bigmoney analytics', 'Senior adviser, Trump 2016 and Trump 2020');

/* chief strategist */
o('chief-strategist', 'Joel Benenson', 'Benenson Strategy Group', 'D', 'liberal-inst abundance-mod', 82, 'analytics persuasion', 'Chief strategist, Hillary Clinton 2016; pollster for Obama 2008 and 2012');
o('chief-strategist', 'Lis Smith', 'Buttigieg 2020', 'D', 'abundance-mod mainstream-prog', 80, 'earned-media viral', 'Senior adviser, Pete Buttigieg 2020');
o('chief-strategist', 'James Carville', 'Carville', 'D', 'labor-liberal liberal-inst', 78, 'earned-media rural', 'Lead strategist, Bill Clinton 1992');
o('chief-strategist', 'Mike Murphy', 'Right to Rise', 'R', 'security-hawk fusionist-con', 77, 'persuasion suburban', 'Ran the Right to Rise super PAC for Jeb Bush 2016; strategist for John McCain 2000');
o('chief-strategist', 'Mark McKinnon', 'The Circus', 'R', 'fusionist-con security-hawk', 76, 'persuasion viral', "Chief media adviser for George W. Bush's 2000 and 2004 campaigns");
o('chief-strategist', 'Alex Castellanos', 'Purple Strategies', 'R', 'fusionist-con maga-populist', 76, 'persuasion senior', 'Republican ad maker and strategist across seven presidential cycles');
o('chief-strategist', 'Waleed Shahid', 'Justice Democrats', 'D', 'prog-populist multiracial-coalition', 72, 'young viral', 'Spokesman and strategist for Justice Democrats');

/* communications director */
o('comms-director', 'Jennifer Palmieri', 'Clinton 2016', 'D', 'liberal-inst abundance-mod', 83, 'persuasion earned-media', 'Communications director, Hillary Clinton 2016; White House communications director');
o('comms-director', 'Ben LaBolt', 'Biden White House', 'D', 'liberal-inst', 82, 'earned-media suburban', 'Press secretary, Obama 2012; White House communications director under Biden');
o('comms-director', 'Brendan Buck', 'Seven Letter', 'R', 'fusionist-con security-hawk', 74, 'earned-media suburban', 'Counselor to Speaker Paul Ryan; communications director to Speaker John Boehner');
o('comms-director', 'Sean Spicer', 'RNC', 'R', 'fusionist-con maga-populist', 72, 'earned-media rural', 'RNC communications director through 2016; White House press secretary');

/* press secretary */
o('press-secretary', 'Robert Gibbs', 'Obama 2008', 'D', 'liberal-inst', 80, 'earned-media persuasion', 'Communications director, Obama 2008; White House press secretary');
o('press-secretary', 'Kayleigh McEnany', 'Trump 2020', 'R', 'maga-populist social-conservative', 78, 'earned-media viral', 'National press secretary, Trump 2020; White House press secretary');
o('press-secretary', 'Josh Earnest', 'United Airlines', 'D', 'liberal-inst abundance-mod', 78, 'persuasion suburban', 'White House press secretary under Obama');
o('press-secretary', 'TJ Ducklo', 'Biden 2020', 'D', 'liberal-inst', 71, 'earned-media young', 'National press secretary, Biden 2020');

/* rapid response */
o('rapid-response', 'Tommy Vietor', 'Crooked Media', 'D', 'liberal-inst mainstream-prog', 77, 'earned-media viral', 'National Security Council spokesman under Obama; co-host of Pod Save America');
o('rapid-response', 'Steve Guest', 'RNC', 'R', 'maga-populist fusionist-con', 75, 'viral earned-media', 'RNC rapid response director; communications adviser to Senator Ted Cruz');
o('rapid-response', 'Bryson Gillette', 'Bryson Gillette', 'D', 'mainstream-prog multiracial-coalition', 74, 'earned-media persuasion', 'Democratic communications and rapid response firm');

/* digital director */
o('digital-director', 'Teddy Goff', 'Precision Strategies', 'D', 'liberal-inst abundance-mod', 88, 'viral analytics', 'Digital director, Obama 2012; co-founder of Precision Strategies');
o('digital-director', 'Jenna Lowenstein', 'Clinton 2016', 'D', 'liberal-inst mainstream-prog', 80, 'small-dollar young', 'Digital director, Hillary Clinton 2016');
o('digital-director', 'Blue State', 'Blue State', 'D', 'liberal-inst mainstream-prog', 80, 'analytics small-dollar', "The digital agency that built Obama 2008's online operation");
o('digital-director', 'Rising Tide Interactive', 'Rising Tide', 'D', 'mainstream-prog multiracial-coalition', 76, 'viral persuasion', 'Democratic digital advertising firm');
o('digital-director', 'Push Digital', 'Push Digital', 'R', 'fusionist-con maga-populist', 75, 'viral small-dollar', "Republican digital agency behind Trump 2016's web operation");
o('digital-director', 'IMGE', 'IMGE', 'R', 'fusionist-con security-hawk', 74, 'analytics suburban', 'Republican digital and creative agency');
o('digital-director', 'Ory Rinat', 'Trump White House', 'R', 'maga-populist tech-right', 74, 'viral analytics', 'White House chief digital officer, 2017-2021');

/* new media director */
o('new-media-director', 'MeidasTouch', 'MeidasTouch Network', 'D', 'liberal-inst mainstream-prog', 80, 'viral persuasion', 'The Democratic-aligned video network that outgrew cable news audiences on YouTube');
o('new-media-director', 'Brian Tyler Cohen', 'Independent', 'D', 'mainstream-prog liberal-inst', 78, 'viral young', 'Democratic YouTube host and interviewer');
o('new-media-director', 'Benny Johnson', 'Independent', 'R', 'maga-populist tech-right', 76, 'viral young', 'Conservative content creator with a large short-form video audience');
o('new-media-director', 'Hasan Piker', 'Twitch', 'D', 'prog-populist', 74, 'young viral', 'Progressive Twitch streamer with one of the largest political live audiences');

/* paid media */
o('paid-media', 'Larry Grisolano', 'AKPD Message and Media', 'D', 'liberal-inst', 82, 'analytics persuasion', "Ran Obama 2012's paid media and opinion research");
o('paid-media', 'OnMessage Inc.', 'OnMessage', 'R', 'fusionist-con maga-populist', 80, 'persuasion rural', 'Republican ad and strategy firm co-founded by Brad Todd');
o('paid-media', 'Waterfront Strategies', 'Waterfront', 'D', 'liberal-inst mainstream-prog', 78, 'bigmoney persuasion', 'The media buyer for Democratic super PACs including Priorities USA');
o('paid-media', 'Ralston Lapp Guinn Media', 'RLG', 'D', 'labor-liberal liberal-inst', 76, 'persuasion rural', 'Democratic ad firm with a long statewide record');
o('paid-media', 'Screen Strategies Media', 'Screen Strategies', 'D', 'liberal-inst abundance-mod', 75, 'bigmoney suburban', 'Democratic media planning and buying firm');
o('paid-media', 'Smart Media Group', 'Smart Media', 'R', 'fusionist-con security-hawk', 74, 'bigmoney senior', 'Republican media buying firm');

/* creative director */
o('creative-director', 'Rick Wilson', 'The Lincoln Project', 'R', 'fusionist-con security-hawk', 76, 'viral persuasion', 'Republican ad maker; co-founder of The Lincoln Project');
o('creative-director', 'McCarthy Hennings Whalen', 'MHW', 'R', 'fusionist-con social-conservative', 74, 'persuasion senior', 'Republican media firm behind a generation of attack ads');

/* national field director */
o('national-field', 'Fair Fight', 'Fair Fight Action', 'D', 'multiracial-coalition mainstream-prog', 84, 'black turnout', "Stacey Abrams' voter registration and protection organization");
o('national-field', 'UNITE HERE', 'UNITE HERE', 'D', 'labor-liberal prog-populist', 83, 'union latino', 'The hospitality workers union and the largest union door-knocking program in the country');
o('national-field', 'LaTosha Brown', 'Black Voters Matter', 'D', 'multiracial-coalition prog-populist', 82, 'black rural', 'Co-founder of Black Voters Matter');
o('national-field', 'Early Vote Action', 'Early Vote Action', 'R', 'maga-populist social-conservative', 78, 'rural turnout', "Scott Presler's Republican voter registration operation");
o('national-field', 'Mi Familia Vota', 'Mi Familia Vota', 'D', 'multiracial-coalition liberal-inst', 76, 'latino turnout', 'Latino civic engagement and registration organization');

/* deputy field director */
o('deputy-field', 'Indivisible', 'Indivisible', 'D', 'mainstream-prog liberal-inst', 75, 'suburban turnout', 'The grassroots network born in 2017 and its volunteer canvass');

/* political director */
o('political-director', 'Ralph Reed', 'Faith & Freedom Coalition', 'R', 'social-conservative fusionist-con', 83, 'rural senior', 'Founder and chairman of the Faith & Freedom Coalition');
o('political-director', 'UAW', 'United Auto Workers', 'D', 'labor-liberal prog-populist', 82, 'union rural', 'The auto workers union and its member program in the industrial Midwest');
o('political-director', 'Planned Parenthood Action Fund', 'PPAF', 'D', 'mainstream-prog liberal-inst', 80, 'suburban young', "The reproductive rights organization's political arm");
o('political-director', 'League of Conservation Voters', 'LCV', 'D', 'mainstream-prog abundance-mod', 79, 'suburban young', "The environmental movement's electoral organization");
o('political-director', 'Teamsters', 'International Brotherhood of Teamsters', 'X', 'labor-liberal maga-populist', 78, 'union rural', 'The union that declined to endorse in 2024 and is courted by both sides');
o('political-director', 'Susan B. Anthony Pro-Life America', 'SBA', 'R', 'social-conservative fusionist-con', 78, 'rural senior', "The anti-abortion movement's electoral organization");
o('political-director', 'Heritage Action', 'Heritage Action for America', 'R', 'fusionist-con social-conservative', 76, 'rural bigmoney', "The Heritage Foundation's grassroots and lobbying arm");

/* finance director */
o('finance-director', 'Grassroots Analytics', 'Grassroots Analytics', 'D', 'mainstream-prog liberal-inst', 74, 'small-dollar analytics', 'Democratic donor data and fundraising analytics firm');
o('finance-director', 'Ron Weiser', 'RNC', 'R', 'fusionist-con', 74, 'bigmoney suburban', 'Former finance chair of the Republican National Committee');

/* operations director */
o('operations-director', 'Michael Glassner', 'Trump 2020', 'R', 'maga-populist', 76, 'ops rural', 'Chief operating officer, Trump 2020');

/* policy director */
o('policy-director', 'Jake Sullivan', 'Clinton 2016', 'D', 'liberal-inst security-hawk', 84, 'persuasion suburban', 'Policy director, Hillary Clinton 2016; National Security Advisor');
o('policy-director', 'Neera Tanden', 'CAP', 'D', 'liberal-inst mainstream-prog', 80, 'suburban persuasion', 'Director of the Domestic Policy Council under Biden; president of CAP');
o('policy-director', 'Russ Vought', 'Center for Renewing America', 'R', 'maga-populist social-conservative', 80, 'rural persuasion', 'Director of the Office of Management and Budget; founder of the Center for Renewing America');

/* research director */
o('research-director', 'Pat Dennis', 'American Bridge', 'D', 'liberal-inst mainstream-prog', 78, 'analytics earned-media', 'President of American Bridge 21st Century');
o('research-director', 'Definers Public Affairs', 'Definers', 'R', 'fusionist-con', 70, 'analytics earned-media', 'Republican opposition research firm');

/* data director */
o('data-director', 'BlueLabs', 'BlueLabs', 'D', 'liberal-inst mainstream-prog', 82, 'analytics turnout', 'The Democratic analytics firm founded by Obama 2012 alumni');
o('data-director', 'Civis Analytics', 'Civis', 'D', 'liberal-inst abundance-mod', 80, 'analytics persuasion', "The data science firm spun out of Obama 2012's analytics team");
o('data-director', 'Alex Lundry', 'Deep Root Analytics', 'R', 'fusionist-con security-hawk', 79, 'analytics suburban', 'Director of data science, Mitt Romney 2012; co-founder of Deep Root Analytics');
o('data-director', 'Deep Root Analytics', 'Deep Root', 'R', 'fusionist-con maga-populist', 77, 'analytics senior', 'Republican television targeting and analytics firm');

/* chief pollster */

/* general counsel */
o('general-counsel', 'Ben Ginsberg', 'Independent', 'R', 'fusionist-con security-hawk', 86, 'legal persuasion', 'National counsel, Bush-Cheney 2000 and 2004; counsel to Mitt Romney 2012');
o('general-counsel', 'Eric Holder', 'NDRC', 'D', 'liberal-inst multiracial-coalition', 84, 'legal black', 'Attorney General under Obama; chairs the National Democratic Redistricting Committee');
o('general-counsel', 'Trevor Potter', 'Campaign Legal Center', 'X', 'security-hawk abundance-mod', 80, 'legal suburban', 'Founder of the Campaign Legal Center; general counsel to John McCain 2000 and 2008');
o('general-counsel', 'Harmeet Dhillon', 'Dhillon Law Group', 'R', 'maga-populist fusionist-con', 78, 'legal rural', 'Republican election lawyer; RNC national committeewoman from California');

/* ══════════════════════════════════════════════════════════════════════════
 * FREE AGENTS — one per slot, never taken off the board. A capable,
 * unremarkable hire who fits any lane and costs almost nothing.
 * ══════════════════════════════════════════════════════════════════════════ */
export const FREE_AGENT_OVR = 60;

/* ── current form ───────────────────────────────────────────────────────────
 * "Last cycle" is derived from the credit line by the ordered rules below, so
 * it is auditable rather than hand-assigned. The most recent cycle a pick
 * worked wins the match, because current form is what we are after.
 * Firms and standing institutions get no record.
 */
const FORM_RULES = [
  [/Harris 2024/,                          'L', 'Harris 2024'],
  [/Trump 2024|2016, 2020 and 2024|all three Trump/, 'W', 'Trump 2024'],
  [/Warnock's 2022/,                       'W', 'Warnock 2022'],
  [/Fetterman's 2022/,                     'W', 'Fetterman 2022'],
  [/Youngkin's 2021/,                      'W', 'Youngkin 2021'],
  [/Sanders 2020|Warren 2020|Harris 2020|Never Back Down/, 'L', '2020 primary'],
  [/Biden 2020/,                           'W', 'Biden 2020'],
  [/Trump 2020/,                           'L', 'Trump 2020'],
  [/Clinton 2016/,                         'L', 'Clinton 2016'],
  [/Cruz 2016|Jeb Bush 2016/,              'L', '2016 primary'],
  [/Romney 2012/,                          'L', 'Romney 2012'],
  [/January 6/,                            'N', 'Resigned'],
  [/Trump 2016|Trump's Florida/,           'W', 'Trump 2016'],
  [/Obama 2012|Obama 2008/,                'W', 'Obama'],
  [/2000 and 2004/,                        'W', 'Bush 2004']
];

import { ROLES as _ROLES } from './roles.js';
for (const r of _ROLES) {
  P.push({
    id: `${r.id}:free-agent`, role: r.id, name: 'Free agent', org: 'Replacement level',
    side: 'X', lanes: [], ovr: FREE_AGENT_OVR, specs: [], free: true,
    credit: `A capable, unremarkable ${r.title.toLowerCase()} off the street. Always available.`
  });
}

for (const p of P) {
  const hit = FORM_RULES.find(([re]) => re.test(p.credit));
  p.form = hit ? hit[1] : 'N';
  p.formCycle = hit ? hit[2] : 'Institution';
}

// Current form nudges a pick's effective rating. Winning a cycle is worth
// something; it is not worth very much.
export const FORM_MULT = { W: 1.025, L: 0.975, N: 1.0 };

// Lanes added for twelve-seat leagues, tagged onto the picks that fit them.
const EXTRA_LANES = {"labor-liberal": ["Rebecca Katz", "Annie Wu Henry", "Devine Mulvey Longabaugh", "AFL-CIO", "Culinary Union Local 226", "Brendan McPhillips", "Celinda Lake", "Mike Donilon", "Faiz Shakir", "Jeff Weaver", "Mark Putnam", "Warren Gunnels", "SEIU", "Ben Tulchin", "John Anzalone", "Jenn Ridder", "Greg Schultz"], "multiracial-coalition": ["Quentin Fulks", "Marlon Marshall", "Jeremy Bird", "Emmy Ruiz", "Cedric Richmond", "Michael Tyler", "Symone Sanders Townsend", "SEIU", "Working Families Party", "Catalist", "Karine Jean-Pierre", "ActBlue", "Marc Elias", "Nina Turner", "Analilia Mejia", "Geoff Garin", "Betsy Hoover", "Rob Flaherty"], "security-hawk": ["Karl Rove", "Stuart Stevens", "Sarah Longwell", "Tim Miller", "Kristen Soltis Anderson", "Charlie Spies", "Katie Walsh Shields", "Sean Cairncross", "Echelon Insights", "Consovoy McCarthy", "National Media", "Something Else Strategies", "Poolhouse", "Glen Bolger", "Todd Ricketts", "Delve", "Sarah Matthews", "Brendan Buck"], "social-conservative": ["Faith & Freedom Coalition", "The Heritage Foundation", "Jamestown Associates", "Sentinel Action Fund", "Cleta Mitchell", "National Rifle Association", "RNC Ground Game", "Hogan Gidley", "Tim Murtaugh", "John McLaughlin", "Alex Latcham", "Chris Carr", "Nick Trainer", "Richard Walters"]};
for (const [lane, names] of Object.entries(EXTRA_LANES))
  for (const p of P) if (names.includes(p.name) && !p.lanes.includes(lane)) p.lanes.push(lane);

/* ── derived fields ─────────────────────────────────────────────────────── */

// Credit price. Steep curve so the top of the board genuinely costs you.
export function priceOf(ovr) {
  return Math.round(6 + Math.pow(Math.max(0, ovr - 58), 1.6) / 2.4);
}

for (const p of P) p.cost = p.free ? 10 : priceOf(p.ovr);

export const OPERATIVES = P;
export const BY_ROLE = P.reduce((acc, p) => ((acc[p.role] ||= []).push(p), acc), {});
for (const list of Object.values(BY_ROLE)) list.sort((a, b) => b.ovr - a.ovr);
export const BY_ID = Object.fromEntries(P.map(p => [p.id, p]));
