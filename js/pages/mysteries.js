export const slug = 'mysteries';
export const title = 'פותרים את התעלומות';

export const sectionClass = 'theme-mysteries';

export const html = `
<span class="kicker">🔎 שלב 11</span>
<h2 class="title">פותרים את התעלומות</h2>
<p class="lead">עכשיו, כשאתם מומחים לגולות, בואו נחזור לשאלות שהתחלנו איתן. לחצו על כל שאלה כדי לגלות את התשובה!</p>
<div class="mystery-list">
    <div class="mystery-container">
        <div class="mystery-note" data-mystery="0" style="--m1: #f59e0b; --m2: #f97316;"><h3>למה קשה לקרוע נייר?</h3></div>
        <div class="answer"><p>הנייר עשוי מצורונים ארוכים מאוד (כמו ספגטי) שמסתבכים זה בזה. כוח הדבקסם ביניהם חזק מאוד. כדי לקרוע את הנייר, אנחנו צריכים להשקיע המון כוח כדי למשוך את כל השרשראות האלה ולהפריד אותן!</p></div>
    </div>
    <div class="mystery-container">
        <div class="mystery-note" data-mystery="1" style="--m1: #06b6d4; --m2: #3b82f6;"><h3>למה סוכר "נעלם" במים?</h3></div>
        <div class="answer"><p>הוא לא נעלם! צורוני המים הקטנים והזריזים מקיפים את צורוני הסוכר הגדולים, נדבקים אליהם מכל הכיוונים ופשוט מושכים אותם אחד-אחד ומפזרים אותם בכל הכוס.</p></div>
    </div>
    <div class="mystery-container">
        <div class="mystery-note" data-mystery="2" style="--m1: #84cc16; --m2: #16a34a;"><h3>מה זה בעצם דבק?</h3></div>
        <div class="answer"><p>דבק עשוי מצורונים ארוכים ודביקים במיוחד. כשהדבק רטוב, הצורונים יכולים לזרום ולהיכנס לחריצים הקטנים של שני הדפים. כשהוא מתייבש, הצורונים נתפסים חזק גם בדף אחד, גם בדף השני, וגם אחד בשני, ויוצרים גשר חזק של כוח דבקסם.</p></div>
    </div>
    <div class="mystery-container">
        <div class="mystery-note" data-mystery="3" style="--m1: #ec4899; --m2: #a855f7;"><h3>למה טיפות מים כדוריות על מחבת שומנית?</h3></div>
        <div class="answer"><p>צורוני המים נמשכים חזק מאוד אחד לשני, אבל הם כמעט ולא נמשכים לצורונים של השמן. אז במקום "להימרח" על השמן, הם מעדיפים להידבק כמה שיותר חזק לעצמם, והצורה הכי טובה לעשות את זה היא... כדור!</p></div>
    </div>
    <div class="mystery-container">
        <div class="mystery-note" data-mystery="4" style="--m1: #22c55e; --m2: #0ea5e9;"><h3>למה גומייה קופצת בחזרה כשמותחים אותה?</h3></div>
        <div class="answer"><p>כשמותחים גומייה, אתם מרחיקים את הצורונים הארוכים שלה זה מזה, נגד כוח הדבקסם שרוצה למשוך אותם בחזרה למקום. ברגע שאתם משחררים, כוח הדבקסם מנצח ומחזיר את כולם הביתה - וזה בדיוק מה שמרגיש כמו קפיצה.</p></div>
    </div>
    <div class="mystery-container">
        <div class="mystery-note" data-mystery="5" style="--m1: #f97316; --m2: #dc2626;"><h3>למה קשה לכופף מזלג מתכת?</h3></div>
        <div class="answer"><p>צורוני המתכת מסודרים בשורות צפופות, נעולות זו בזו בעזרת כוח דבקסם חזק מאוד. כדי לכופף את המזלג צריך לדחוף בכוח אדיר את כל השורות האלה למקום חדש - וגם אז חלק מהצורונים "מתגעגעים" למקום הישן ומנסים למשוך אותו בחזרה.</p></div>
    </div>
    <div class="mystery-container">
        <div class="mystery-note" data-mystery="6" style="--m1: #a78bfa; --m2: #4338ca;"><h3>למה שומעים "קראק" כשמקל נשבר?</h3></div>
        <div class="answer"><p>כשמכופפים מקל, מותחים יותר ויותר את הדבקסם שבין הצורונים שבצד החיצוני שלו, עד שהוא פשוט לא מחזיק מעמד ומשתחרר בבת אחת. כל השחרורים האלה ביחד יוצרים את הרעש שאתם שומעים.</p></div>
    </div>
</div>
<div class="actions">
    <a href="#/puddle" class="btn btn-ghost">חזרה</a>
    <a href="#/reactions" class="btn">כל הכבוד! אבל נשאר סוד ענק אחד...</a>
</div>
`;

export function init(page) {
    const answers = page.root.querySelectorAll('.answer');
    page.root.querySelectorAll('[data-mystery]').forEach(note => {
        note.addEventListener('click', () => {
            const open = answers[Number(note.dataset.mystery)].classList.toggle('visible');
            note.parentElement.classList.toggle('open', open);
        }, { signal: page.signal });
    });
}
