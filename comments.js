import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
        const supabaseUrl = 'https://dbyvyvspkkhkkzucrmky.supabase.co'; 
        const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRieXZ5dnNwa2toa2t6dWNybWt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxNjc1NjksImV4cCI6MjA3Mjc0MzU2OX0.wGQhvVaDq51Qg8cYeQBdab3tnmir-QUPVHmzvL_4cyk';
        const supabase = createClient(supabaseUrl, supabaseKey);

    const form = document.getElementById('comment-form');
  const commentsContainer = document.getElementById('comments-container');

  // Function to render comments
  function renderComments(comments) {
    commentsContainer.innerHTML = ''; // Clear old list
    comments.forEach(c => {
      const div = document.createElement('div');
      div.style.borderBottom = '1px solid #888';
      div.style.padding = '5px 0';
      div.innerHTML = `<strong>${c.name}</strong>: ${c.comment}`;
      commentsContainer.appendChild(div);
    });
  }

  // Fetch all comments on load
  async function loadComments() {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      console.error('Error loading comments:', error.message);
    } else {
      renderComments(data);
    }
  }

  // Listen for new comments in real time
  supabase
    .channel('public:comments')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'comments' },
      payload => {
        // Append the new comment to the list
        const c = payload.new;
        const div = document.createElement('div');
        div.style.borderBottom = '1px solid #888';
        div.style.padding = '5px 0';
        div.innerHTML = `<strong>${c.name}</strong>: ${c.comment}`;
        commentsContainer.appendChild(div);
      }
    )
    .subscribe();

  // Handle form submission
  form.addEventListener('submit', async function (event) {
    event.preventDefault();

    const name = document.getElementById('name').value;
    const comment = document.getElementById('comment').value;

    const { error } = await supabase
      .from('comments')
      .insert([{ name, comment }]);

    if (error) {
      console.error('Insert failed:', error.message);
    } else {
      form.reset(); // Clear form
    }
  });

  // Initial load
  loadComments();