export const slug = 'mysteries';
export const title = 'פותרים את התעלומות';

export const sectionClass = 'flex-col justify-start items-center text-center bg-yellow-100';

export const html = `
<h2 class="responsive-subtitle font-bold mt-4 sm:mt-8 mb-4">פותרים את התעלומות</h2>
<p class="max-w-3xl mx-auto responsive-text mb-6 sm:mb-8 px-4">עכשיו, כשאתם מומחים לגולות, בואו נחזור לשאלות שהתחלנו איתן. לחצו על כל שאלה כדי לגלות את התשובה!</p>
<div class="w-full max-w-3xl space-y-3 sm:space-y-4 px-4">
    <div class="mystery-container bg-white rounded-lg shadow-md">
       <div data-mystery="0" class="mystery-note p-3 sm:p-4 bg-yellow-300 rounded-lg">
           <h3 class="text-lg sm:text-xl font-bold">למה קשה לקרוע נייר?</h3>
       </div>
       <div class="answer text-right">
           <p class="responsive-text">הנייר עשוי מצורונים ארוכים מאוד (כמו ספגטי) שמסתבכים זה בזה. כוח הדבקסם ביניהם חזק מאוד. כדי לקרוע את הנייר, אנחנו צריכים להשקיע המון כוח כדי למשוך את כל השרשראות האלה ולהפריד אותן!</p>
       </div>
    </div>
    <div class="mystery-container bg-white rounded-lg shadow-md">
       <div data-mystery="1" class="mystery-note p-3 sm:p-4 bg-cyan-300 rounded-lg">
           <h3 class="text-lg sm:text-xl font-bold">למה סוכר "נעלם" במים?</h3>
       </div>
       <div class="answer text-right">
            <p class="responsive-text">הוא לא נעלם! צורוני המים הקטנים והזריזים מקיפים את צורוני הסוכר הגדולים, נדבקים אליהם מכל הכיוונים ופשוט מושכים אותם אחד-אחד ומפזרים אותם בכל הכוס.</p>
       </div>
    </div>
    <div class="mystery-container bg-white rounded-lg shadow-md">
       <div data-mystery="2" class="mystery-note p-3 sm:p-4 bg-lime-300 rounded-lg">
           <h3 class="text-lg sm:text-xl font-bold">מה זה בעצם דבק?</h3>
       </div>
       <div class="answer text-right">
           <p class="responsive-text">דבק עשוי מצורונים ארוכים ודביקים במיוחד. כשהדבק רטוב, הצורונים יכולים לזרום ולהיכנס לחריצים הקטנים של שני הדפים. כשהוא מתייבש, הצורונים נתפסים חזק גם בדף אחד, גם בדף השני, וגם אחד בשני, ויוצרים גשר חזק של כוח דבקסם.</p>
       </div>
    </div>
    <div class="mystery-container bg-white rounded-lg shadow-md">
       <div data-mystery="3" class="mystery-note p-3 sm:p-4 bg-orange-300 rounded-lg">
           <h3 class="text-lg sm:text-xl font-bold">למה טיפות מים כדוריות על מחבת שומנית?</h3>
       </div>
       <div class="answer text-right">
           <p class="responsive-text">צורוני המים נמשכים חזק מאוד אחד לשני, אבל הם כמעט ולא נמשכים לצורונים של השמן. אז במקום "להימרח" על השמן, הם מעדיפים להידבק כמה שיותר חזק לעצמם, והצורה הכי טובה לעשות את זה היא... כדור!</p>
       </div>
    </div>
</div>
<div class="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6 sm:mt-8 px-4">
   <a href="#/attraction" class="w-full sm:w-auto px-6 py-3 bg-gray-400 text-black font-bold text-lg sm:text-xl rounded-full shadow-md hover:bg-gray-500 transition-colors">חזרה</a>
   <a href="#/summary" class="w-full sm:w-auto px-6 py-3 bg-yellow-500 text-white font-bold text-lg sm:text-xl rounded-full shadow-md hover:bg-yellow-600 transition-colors">כל הכבוד! יש עוד משהו לדעת?</a>
</div>
`;

export function init(page) {
    const answers = page.root.querySelectorAll('.answer');
    page.root.querySelectorAll('[data-mystery]').forEach(note => {
        note.addEventListener('click', () => {
            answers[Number(note.dataset.mystery)].classList.toggle('visible');
        }, { signal: page.signal });
    });
}
