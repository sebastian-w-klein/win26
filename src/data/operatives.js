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

/* ── 20. CHIEF POLLSTER ─────────────────────────────────────────────────── */
o('chief-pollster', 'Tony Fabrizio', 'Fabrizio Ward', 'R', 'maga-populist fusionist-con', 90, 'rural analytics', "Trump's lead pollster in 2016, 2020 and 2024");
o('chief-pollster', 'John Anzalone', 'Impact Research', 'D', 'liberal-inst abundance-mod', 86, 'rural persuasion', 'Lead pollster for Obama 2012 and Biden 2020');
o('chief-pollster', 'Geoff Garin', 'Hart Research', 'D', 'liberal-inst mainstream-prog', 84, 'analytics suburban', 'President of Hart Research; lead pollster for Harris 2024');
o('chief-pollster', 'Molly Murphy', 'Impact Research', 'D', 'liberal-inst abundance-mod', 83, 'suburban analytics', 'President of Impact Research; pollster for the Biden and Harris campaigns');
o('chief-pollster', 'Celinda Lake', 'Lake Research Partners', 'D', 'prog-populist liberal-inst', 82, 'union senior', 'Co-lead pollster for Biden 2020');
o('chief-pollster', 'Kristen Soltis Anderson', 'Echelon Insights', 'R', 'fusionist-con tech-right abundance-mod', 81, 'young suburban', 'Republican pollster and co-founder of Echelon Insights');
o('chief-pollster', 'Ben Tulchin', 'Tulchin Research', 'D', 'prog-populist mainstream-prog', 77, 'young union', 'Pollster for Bernie Sanders 2016 and 2020');
o('chief-pollster', 'John McLaughlin', 'McLaughlin & Associates', 'R', 'maga-populist', 76, 'rural latino', 'A Trump campaign pollster across multiple cycles');

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

for (const p of P) {
  const hit = FORM_RULES.find(([re]) => re.test(p.credit));
  p.form = hit ? hit[1] : 'N';
  p.formCycle = hit ? hit[2] : 'Institution';
}

// Current form nudges a pick's effective rating. Winning a cycle is worth
// something; it is not worth very much.
export const FORM_MULT = { W: 1.025, L: 0.975, N: 1.0 };

/* ── derived fields ─────────────────────────────────────────────────────── */

// Credit price. Steep curve so the top of the board genuinely costs you.
export function priceOf(ovr) {
  return Math.round(6 + Math.pow(Math.max(0, ovr - 58), 1.6) / 2.4);
}

for (const p of P) p.cost = priceOf(p.ovr);

export const OPERATIVES = P;
export const BY_ROLE = P.reduce((acc, p) => ((acc[p.role] ||= []).push(p), acc), {});
for (const list of Object.values(BY_ROLE)) list.sort((a, b) => b.ovr - a.ovr);
export const BY_ID = Object.fromEntries(P.map(p => [p.id, p]));
