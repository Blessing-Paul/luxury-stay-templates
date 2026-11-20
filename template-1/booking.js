const form = document.querySelector("#reservation-form");
const fields = form.elements;
const workspace = document.querySelector(".web-booking-workspace");
const confirmation = document.querySelector("#booking-confirmation");
const entry = document.querySelector("#reservation-entry");
const review = document.querySelector("#reservation-review");
const estimate = document.querySelector("#booking-total");
const back = document.querySelector("#booking-back");
const submit = form.querySelector("[type=submit]");
const errorBox = document.querySelector("#booking-errors");
const steps = document.querySelectorAll("#booking-steps li");
const params = new URLSearchParams(window.location.search);

const rooms = {
  deluxe: { name: "Deluxe Room", rate: 95000, capacity: 2 },
  executive: { name: "Executive Suite", rate: 155000, capacity: 3 },
  presidential: { name: "Presidential Suite", rate: 280000, capacity: 4 }
};
const venues = {
  ballroom: { name: "Grand Ballroom", rate: 120000, capacity: 250 },
  boardroom: { name: "Boardroom", rate: 35000, capacity: 20 },
  terrace: { name: "Garden Terrace", rate: 75000, capacity: 80 }
};
const extras = {
  pickup: { name: "Airport pickup", rate: 25000 },
  spa: { name: "Spa package", rate: 55000 },
  romantic: { name: "Romantic setup", rate: 40000 }
};
const pictures = {
  room: { deluxe: "../files/room-1.jpg", executive: "../files/room-2.jpg", presidential: "../files/room-3.jpg" },
  venue: { ballroom: "../files/hall-1.jpg", boardroom: "../files/hall-2.jpg", terrace: "../files/garden-area.jpg" }
};

const money = new Intl.NumberFormat("en-NG", {
  style: "currency", currency: "NGN", maximumFractionDigits: 0
});
const dateFormat = new Intl.DateTimeFormat("en-NG", { dateStyle: "long", timeZone: "UTC" });
const dateTimeFormat = new Intl.DateTimeFormat("en-NG", { dateStyle: "long", timeStyle: "short" });
const day = 86400000;
let mode = "stay";
let reviewing = false;
let processing = false;
let showingErrors = false;

function make(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

// Renders a catalog as radio cards. The radios share the field name, so
// fields.room / fields.venue / fields.extra still read and write by value.
function renderChoices(catalogName, inputName, catalog, interval = "") {
  const group = form.querySelector('[data-catalog="' + catalogName + '"]');
  Object.entries(catalog).forEach(([value, item], index) => {
    const label = make("label", "web-choice");
    const input = make("input");
    input.type = inputName === "extra" ? "checkbox" : "radio";
    input.name = inputName;
    input.value = value;
    input.defaultChecked = inputName !== "extra" && index === 0; // default state, so form.reset() restores the first option
    const card = make("span", "web-choice-card");
    const picture = pictures[inputName] && pictures[inputName][value];
    if (picture) {
      const image = make("img");
      image.src = picture;
      image.alt = "";
      image.loading = "lazy";
      card.append(image);
    }
    const body = make("span", "web-choice-body");
    body.append(make("strong", "", item.name));
    if (item.capacity) body.append(make("small", "", "Up to " + item.capacity + " guests"));
    card.append(body);
    if (item.rate) {
      const price = make("span", "web-choice-price", (inputName === "extra" ? "+" : "") + money.format(item.rate));
      if (interval) price.append(make("small", "", interval));
      card.append(price);
    }
    label.append(input, card);
    group.append(label);
  });
}

function describeDate(value) {
  return value ? dateFormat.format(new Date(value + "T00:00:00Z")) : "Select a date";
}

function describeDateTime(value) {
  return value ? dateTimeFormat.format(new Date(value)) : "Select a date and time";
}

function validDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value || "") &&
    new Date(value + "T00:00:00Z").toISOString().slice(0, 10) === value;
}

function selectedExtras() { return [...form.querySelectorAll('input[name="extra"]:checked')].map(input => extras[input.value]); }
const roomQuantities = Object.fromEntries(Object.keys(rooms).map(key => [key, 0]));
let allocation = [];
function syncAllocation() {
 const target = document.querySelector('#occupancy-rooms');
 const count = Math.max(1,Math.min(10,Number(fields.roomCount.value)||1));
 while(allocation.length<count)allocation.push({adults:allocation.length===0?Number(fields.adults.value)||1:1,children:0});
 allocation.length=count;
 target.replaceChildren();
 allocation.forEach((item,i)=>{
  const row=make('div','web-occupancy-row');row.append(make('strong','',`Room ${i+1}`));
  for(const key of ['adults','children']){
   const label=make('label','',key==='adults'?'Adults':'Children');const input=make('input','form-control');
   input.type='number';input.min=key==='adults'?'1':'0';input.max='20';input.value=item[key];input.dataset.allocationIndex=i;input.dataset.allocationKind=key;
   label.append(input);row.append(label);
  }target.append(row);
 });
 updateAllocationStatus();
}
function updateAllocationStatus(){
 const a=allocation.reduce((n,x)=>n+x.adults,0),c=allocation.reduce((n,x)=>n+x.children,0);
 const ok=a===Number(fields.adults.value)&&c===Number(fields.children.value);
 const status=document.querySelector('#allocation-status');
 status.textContent=ok?`All ${a+c} guests assigned across ${allocation.length} room(s).`:`Assigned ${a} of ${fields.adults.value} adults and ${c} of ${fields.children.value} children. Adjust room allocations to match your totals.`;
 status.classList.toggle('web-allocation-error',!ok);return ok;
}
function nightPlans(){return [{rooms:Object.entries(roomQuantities).filter(([,count])=>count>0).map(([type,count])=>({type,count}))}];}
function bookingDetails(){
 const stay=mode==='stay',nights=(Date.parse(fields.departure.value)-Date.parse(fields.arrival.value))/day;
 const duration=(Date.parse(fields.endDateTime.value)-Date.parse(fields.startDateTime.value))/3600000,venue=venues[fields.venue.value];
 const rows=[];let charge=0;
 if(stay){
  rows.push(['Check-in',describeDate(fields.arrival.value)],['Check-out',describeDate(fields.departure.value)],['Nights',String(Math.max(0,nights)||0)],['Rooms',fields.roomCount.value],['Adults',fields.adults.value],['Children',fields.children.value],['Total guests',fields.guests.value]);
  if(Number(fields.children.value))rows.push(['Children’s ages',[...document.querySelectorAll('#children-ages select')].map(x=>x.value).join(', ')]);
  allocation.forEach((x,i)=>rows.push([`Room ${i+1} occupancy`,`${x.adults} adult(s), ${x.children} child(ren)`]));
  nightPlans()[0].rooms.forEach(x=>{rows.push(['Selected rooms',`${x.count} × ${rooms[x.type].name} · ${nights} night(s)`]);charge+=x.count*rooms[x.type].rate*Math.max(0,nights);});
  selectedExtras().forEach(x=>rows.push(['Extra',`${x.name} · ${money.format(x.rate)}`]));
 }else{charge=venue.rate*duration;rows.push(['Venue',venue.name],['Occasion',fields.occasion.value],['Start date and time',describeDateTime(fields.startDateTime.value)],['End date and time',describeDateTime(fields.endDateTime.value)],['Attendees',fields.attendees.value]);}
 const extraTotal=stay?selectedExtras().reduce((sum,x)=>sum+x.rate,0):0;
 const ready=stay?nights>0:duration>0&&fields.startDateTime.value&&fields.endDateTime.value;
 if(ready)rows.push([stay?'Accommodation':'Venue hire',money.format(charge)]);
 return {rows,total:ready?money.format(charge+extraTotal):(stay?'Select your stay dates':'Select your event date and time')};
}
function renderNightPlans(){
 const target=document.querySelector('#nightly-rooms');target.replaceChildren();
 const grid=make('div','web-room-grid');
 Object.entries(rooms).forEach(([key,room])=>{
  const card=make('article','web-room-select-card');
  const picture=make('div','web-room-select-photo');const img=make('img');img.src=pictures.room[key]||'';img.alt=room.name;img.loading='lazy';picture.append(img);
  const info=make('div','web-room-select-info');info.append(make('h4','',room.name),make('p','',`Sleeps up to ${room.capacity} guests per room`),make('strong','',`${money.format(room.rate)} / night`));
  const controls=make('div','web-quantity-control');const minus=make('button','','−');minus.type='button';minus.setAttribute('aria-label',`Remove ${room.name}`);minus.dataset.roomAdjust=key;minus.dataset.delta='-1';minus.disabled=roomQuantities[key]===0;
  const value=make('output','',String(roomQuantities[key]));value.setAttribute('aria-label',`${room.name} quantity`);
  const plus=make('button','','+');plus.type='button';plus.setAttribute('aria-label',`Add ${room.name}`);plus.dataset.roomAdjust=key;plus.dataset.delta='1';plus.disabled=Object.values(roomQuantities).reduce((a,b)=>a+b,0)>=Number(fields.roomCount.value);
  controls.append(minus,value,plus);info.append(controls);card.append(picture,info);grid.append(card);
 });target.append(grid);
 const selected=Object.values(roomQuantities).reduce((a,b)=>a+b,0);
 target.append(make('p','web-field-hint web-room-progress',`${selected} of ${fields.roomCount.value} room(s) selected for the entire stay.`));
}
function validateNightPlans(){
 const chosen=nightPlans()[0].rooms,quantity=chosen.reduce((n,x)=>n+x.count,0);
 if(quantity!==Number(fields.roomCount.value))return `Select exactly ${fields.roomCount.value} room(s). Currently selected: ${quantity}.`;
 const capacity=chosen.reduce((n,x)=>n+x.count*rooms[x.type].capacity,0);
 if(capacity<Number(fields.guests.value))return `Selected rooms accommodate ${capacity} guests; your group has ${fields.guests.value}.`;
 // Capacity alone cannot verify individual room assignments. Match allocations to selected room capacities.
 const capacities=chosen.flatMap(x=>Array(x.count).fill(rooms[x.type].capacity)).sort((a,b)=>a-b);
 const occupants=allocation.map(x=>x.adults+x.children).sort((a,b)=>a-b);
 if(occupants.some((count,i)=>count>capacities[i]))return 'At least one room allocation exceeds the selected room capacities. Adjust your room types or guest distribution.';
 return '';
}

function renderDetails(target, rows) {
  target.replaceChildren();
  for (const [label, value] of rows) {
    const row = document.createElement("div");
    const term = document.createElement("dt");
    const description = document.createElement("dd");
    term.textContent = label;
    description.textContent = value;
    if (/^Select /.test(value)) description.className = "is-empty";
    row.append(term, description);
    target.append(row);
  }
}

function setStep(name) {
  const order = ["details", "review", "receipt"];
  steps.forEach(step => {
    const position = order.indexOf(step.dataset.step);
    const current = position === order.indexOf(name);
    step.classList.toggle("is-current", current);
    step.classList.toggle("is-done", position < order.indexOf(name));
    if (current) step.setAttribute("aria-current", "step"); else step.removeAttribute("aria-current");
  });
}

function syncChildAges() {
  const wrap = document.querySelector("#children-ages-wrap");
  const container = document.querySelector("#children-ages");
  const count = Math.max(0, Math.min(20, Number(fields.children.value) || 0));
  wrap.hidden = count === 0;
  while (container.children.length > count) container.lastElementChild.remove();
  while (container.children.length < count) {
    const index = container.children.length + 1;
    const label = make("label", "", `Child ${index} age`);
    const select = make("select", "form-select");
    select.name = `childAge${index}`;
    select.required = true;
    const placeholder = make("option", "", "Choose an age");
    placeholder.value = "";
    placeholder.selected = true;
    placeholder.disabled = true;
    select.append(placeholder);
    for (let age = 0; age <= 17; age++) {
      const option = make("option", "", age === 0 ? "Under 1" : String(age));
      option.value = String(age);
      select.append(option);
    }
    label.append(select);
    container.append(label);
  }
}

function updateBooking() {
  const nextDay = fields.arrival.value && new Date(Date.parse(fields.arrival.value) + day);
  fields.departure.min = nextDay ? nextDay.toISOString().slice(0, 10) : fields.arrival.min;
  const room = rooms[fields.room.value];
  const venue = venues[fields.venue.value];
  const adults = Number(fields.adults.value || 0);
  const children = Number(fields.children.value || 0);
  const roomCount = Number(fields.roomCount.value || 0);
  fields.guests.value = String(adults + children);
  syncChildAges();
  if (allocation.length !== roomCount) syncAllocation(); else updateAllocationStatus();
  fields.attendees.max = venue.capacity;
  document.querySelector("#guest-hint").textContent = `${adults + children} guests (${adults} adults, ${children} children) across ${roomCount} room(s). ${room.name} allows up to ${room.capacity} guests per room.`;
  document.querySelector("#venue-hint").textContent = venue.name + " holds up to " + venue.capacity + " guests.";

  fields.departure.setCustomValidity(fields.arrival.value && fields.departure.value && fields.departure.value <= fields.arrival.value
    ? "Check-out must be after check-in." : "");
  fields.roomCount.setCustomValidity("");
  fields.adults.setCustomValidity(adults < roomCount ? 'Choose at least one adult per room.' : '');
  fields.attendees.setCustomValidity(Number(fields.attendees.value) > venue.capacity
    ? venue.name + " holds up to " + venue.capacity + " guests. Reduce the attendees or choose a larger venue." : "");
  fields.endDateTime.setCustomValidity(fields.startDateTime.value && fields.endDateTime.value &&
    Date.parse(fields.endDateTime.value) <= Date.parse(fields.startDateTime.value)
    ? "Choose an end date and time after the start date and time." : "");
  fields.guestName.setCustomValidity(fields.guestName.value && !fields.guestName.value.trim()
    ? "Enter your full name." : "");

  const nights = (Date.parse(fields.departure.value) - Date.parse(fields.arrival.value)) / day;
  document.querySelector("#stay-length").textContent = nights > 0
    ? nights + (nights === 1 ? " night" : " nights") + " · " + money.format(room.rate) + " per night"
    : "Choose your dates to see the total.";

  if (mode === "stay" && stayStage === 1) renderNightPlans();
  const { rows, total } = bookingDetails();
  renderDetails(document.querySelector("#booking-summary"), rows);
  if (estimate.textContent !== total) estimate.textContent = total;
  estimate.classList.toggle("is-empty", /^Select /.test(total));
}

const labels = {
  arrival: "check-in date", departure: "check-out date", guests: "number of guests",
  attendees: "number of attendees", startDateTime: "start date and time", endDateTime: "end date and time",
  guestName: "full name", email: "email address"
};

function friendly(control) {
  const state = control.validity;
  const label = labels[control.name] || control.name;
  if (state.customError) return control.validationMessage;
  if (state.valueMissing) return ["date", "time", "datetime-local"].includes(control.type) ? "Choose a " + label + "." : "Enter your " + label + ".";
  if (state.typeMismatch) return "Enter a valid email address, like name@example.com.";
  if (state.rangeUnderflow) return control.type === "date" || control.type === "datetime-local"
    ? "The " + label + " can’t be in the past." : "Enter at least " + control.min + " for the " + label + ".";
  if (state.rangeOverflow) return "Enter no more than " + control.max + " for the " + label + ".";
  return control.validationMessage;
}

// Shows every problem in one place, links each message to its field, and
// marks the fields themselves. Returns true when something needs fixing.
function renderProblems(focus) {
  const problems = [...form.elements].filter(control =>
    control.name && control.type !== "radio" && control.willValidate && !control.validity.valid);
  [...form.elements].forEach(control => {
    const bad = problems.includes(control);
    control.classList.toggle("is-invalid", bad);
    if (bad) control.setAttribute("aria-invalid", "true"); else control.removeAttribute("aria-invalid");
  });
  errorBox.replaceChildren();
  errorBox.hidden = !problems.length;
  if (!problems.length) return false;
  errorBox.append(make("strong", "", problems.length === 1 ? "One thing needs your attention" : problems.length + " things need your attention"));
  const list = make("ul");
  problems.forEach(control => {
    control.id = control.id || "field-" + control.name;
    const link = make("a", "", friendly(control));
    link.href = "#" + control.id;
    link.addEventListener("click", event => { event.preventDefault(); control.focus(); });
    const item = make("li");
    item.append(link);
    list.append(item);
  });
  errorBox.append(list);
  if (focus) errorBox.focus(); // summary first; each message links to its field
  return true;
}

function guestDetails() {
  const details = [["Guest", fields.guestName.value.trim()], ["Email", fields.email.value]];
  if (fields.notes.value.trim()) details.push(["Special requests", fields.notes.value.trim()]);
  return details;
}

function showReview(show, focus = true) {
  reviewing = show;
  entry.hidden = show;
  review.hidden = !show;
  submit.textContent = show ? "Simulate payment" : "Review reservation";
  stageNavigation.hidden = show || mode !== "stay";
  if (!show) showStayStage(stayStage);
  setStep(show ? "review" : "details");
  if (show) {
    const { rows, total } = bookingDetails();
    renderDetails(document.querySelector("#booking-review"), [...rows, ...guestDetails(), ["Total", total]]);
  }
  if (focus) (show ? review : entry).querySelector("h2").focus();
}

function chooseMode(next) {
  mode = fields.reservationType.value = next;
  form.querySelectorAll("[data-fields]").forEach(group => {
    group.disabled = group.hidden = group.dataset.fields !== mode;
  });
  updateBooking();
  showStayStage(stayStage);
  if (showingErrors) renderProblems(false);
}

function confirmBooking() {
  const { rows, total } = bookingDetails();
  const reference = "SS-" + Array.from(crypto.getRandomValues(new Uint8Array(6)), byte =>
    byte.toString(16).padStart(2, "0")).join("").toUpperCase();
  renderDetails(document.querySelector("#receipt-details"), [
    ["Reference", reference], ["Issued", describeDate(fields.arrival.min)],
    ...guestDetails(), ...rows, ["Payment status", "Simulated payment complete"], ["Simulated total", total]
  ]);
  workspace.hidden = true;
  confirmation.hidden = false;
  setStep("receipt");
  confirmation.querySelector("h2").focus();
}

// Short processing state so the payment step feels like a real action.
function processPayment() {
  if (processing) return;
  processing = true;
  submit.disabled = true;
  submit.textContent = "Processing…";
  form.setAttribute("aria-busy", "true");
  setTimeout(() => {
    processing = false;
    form.removeAttribute("aria-busy");
    submit.disabled = false;
    confirmBooking();
  }, 900);
}

// Guided stay journey; event reservations retain their existing independent form.
let stayStage=0;
const stayStages=[...document.querySelectorAll('.web-stay-stage')];
const contactStage=document.querySelector('#contact-stage');
const stageNavigation=document.querySelector('#stage-navigation');
const stageBack=document.querySelector('#stage-back');
const stageNext=document.querySelector('#stage-next');
function showStayStage(index){
 stayStage=Math.max(0,Math.min(2,index));const isStay=mode==='stay';
 stayStages.forEach((panel,i)=>{panel.hidden=!isStay||i!==stayStage;});
 contactStage.hidden=isStay&&stayStage!==2;
 stageNavigation.hidden=!isStay||reviewing;stageBack.hidden=stayStage===0;
 stageNext.hidden=stayStage===2;stageNext.textContent=stayStage===1?'Continue to guest information':'Find room options';
 submit.hidden=isStay&&stayStage!==2;
 if(isStay&&stayStage===1)renderNightPlans();
}
function stageValid(){
 updateBooking();
 if(stayStage===0){
  if(Number(fields.adults.value)<Number(fields.roomCount.value)){fields.adults.setCustomValidity('Choose at least one adult per room.');}else fields.adults.setCustomValidity('');
  for(const name of ['arrival','departure','roomCount','adults','children']){const field=fields[name];if(!field.checkValidity()){field.reportValidity();field.focus();return false;}}
  for(const age of document.querySelectorAll('#children-ages select'))if(!age.checkValidity()){age.reportValidity();return false;}
  if(!updateAllocationStatus()){document.querySelector('#occupancy-rooms').scrollIntoView({block:'center'});return false;}
 }
 if(stayStage===1){const issue=validateNightPlans();if(issue){alert(issue);return false;}}
 return true;
}
form.addEventListener('input',event=>{
 if(event.target.dataset.allocationIndex!==undefined){const index=Number(event.target.dataset.allocationIndex),key=event.target.dataset.allocationKind;allocation[index][key]=Math.max(key==='adults'?1:0,Number(event.target.value)||0);updateAllocationStatus();}
});
form.addEventListener('click',event=>{
 const btn=event.target.closest('[data-room-adjust]');if(!btn)return;
 const key=btn.dataset.roomAdjust,delta=Number(btn.dataset.delta),total=Object.values(roomQuantities).reduce((a,b)=>a+b,0);
 if(delta>0&&total>=Number(fields.roomCount.value))return;
 roomQuantities[key]=Math.max(0,roomQuantities[key]+delta);renderNightPlans();updateBooking();
});
stageNext.addEventListener('click',()=>{if(stageValid())showStayStage(stayStage+1);});
stageBack.addEventListener('click',()=>showStayStage(stayStage-1));
renderChoices("venues", "venue", venues, "/hour");
renderChoices("extras", "extra", extras);
const today = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Africa/Lagos", year: "numeric", month: "2-digit", day: "2-digit"
}).format(new Date());
fields.arrival.min = fields.departure.min = today;
fields.startDateTime.min = fields.endDateTime.min = today + "T00:00";

// Links from the site: ?room=, ?venue=, ?type=event, and the hero availability bar (?arrival=&departure=&guests=)
const hasRoom = Object.hasOwn(rooms, params.get("room"));
if (hasRoom) { fields.room.value = params.get("room"); roomQuantities[params.get("room")] = 1; }
if (Object.hasOwn(venues, params.get("venue"))) fields.venue.value = params.get("venue");
const requestedGuests = parseInt(params.get("guests"), 10);
if (requestedGuests > 0 && !hasRoom) {
  const fit = Object.keys(rooms).find(key => rooms[key].capacity >= requestedGuests);
  if (fit) fields.room.value = fit;
}
if (requestedGuests > 0) fields.adults.value = Math.min(requestedGuests, 20);
if (validDate(params.get("arrival")) && params.get("arrival") >= fields.arrival.min) {
  fields.arrival.value = params.get("arrival");
  if (validDate(params.get("departure")) && params.get("departure") > fields.arrival.value) {
    fields.departure.value = params.get("departure");
  }
}

form.addEventListener("change", event => {
 if(['roomCount','adults','children'].includes(event.target.name)){
  const count=Number(fields.roomCount.value)||1,adults=Number(fields.adults.value)||0,children=Number(fields.children.value)||0;
  allocation=Array.from({length:count},(_,i)=>({adults:i===0?Math.max(1,adults-count+1):1,children:i===0?children:0}));syncAllocation();
 }

  if (event.target.name === "reservationType") chooseMode(event.target.value);
});
form.addEventListener("input", () => {
  updateBooking();
  if (showingErrors) renderProblems(false);
});
form.addEventListener("click", event => {
  const button = event.target.closest("[data-step-target]");
  if (!button) return;
  const input = fields[button.dataset.stepTarget];
  if (Number(button.dataset.dir) > 0) input.stepUp(); else input.stepDown();
  input.dispatchEvent(new Event("input", { bubbles: true }));
});
back.addEventListener("click", () => {showReview(false); showStayStage(2);});
form.noValidate = true;
form.addEventListener("submit", event => {
  event.preventDefault();
  updateBooking();
  if (reviewing) {
    processPayment();
    return;
  }
  if (mode === "stay" && stayStage !== 2) { if(stageValid()) showStayStage(stayStage+1); return; }
  showingErrors = true;
  if (mode === "stay" && validateNightPlans()) { alert(validateNightPlans()); showStayStage(1); return; }
  if (renderProblems(true)) return;
  showingErrors = false;
  showReview(true);
});
document.querySelector("#print-receipt").addEventListener("click", () => window.print());
document.querySelector("#new-booking").addEventListener("click", () => {
  form.reset();
  document.querySelector("#children-ages").replaceChildren();
  showingErrors = false;
  renderProblems(false);
  confirmation.hidden = true;
  workspace.hidden = false;
  chooseMode(mode);
  showReview(false);
  Object.keys(roomQuantities).forEach(key=>roomQuantities[key]=0);allocation=[];
  showStayStage(0);
});

syncAllocation();
chooseMode(params.get("type") === "event" ? "event" : "stay");
workspace.hidden = false;

showStayStage(0);
