import type{Achievement}from'./types';
export function updatePaperFields(previous:Achievement,changes:Partial<Achievement>){const next={...previous,...changes};if(next.category!=='paper')return next;
 if(changes.date!==undefined){if(next.status==='accepted')next.acceptedDate=changes.date;else if(next.status==='published')next.publishedDate=changes.date;}
 if(changes.acceptedDate&&next.status==='accepted')next.date=changes.acceptedDate;
 if(changes.publishedDate&&next.status==='published')next.date=changes.publishedDate;
 if(changes.status!==undefined)next.date=next.status==='published'?(next.publishedDate||next.date):next.status==='accepted'?(next.acceptedDate||next.date):next.date;
 if(next.paperVenue==='conference')next.level='2';
 return next;
}
