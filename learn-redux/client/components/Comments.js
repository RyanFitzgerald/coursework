import React from 'react';

class Comments extends React.Component {
  renderComment(comment, i) {
    return (
      <div className="comment" key={i}>
        <p>
          <strong>{comment.user}</strong>
          {comment.text}
          <button className="remove-comment" onClick={this.props.removeComment.bind(null, this.props.params.postId, i)}>&times;</button>
        </p>
      </div>
    );
  }

  handleSubmit(e) {
    e.preventDefault();
    const { postId } = this.props.params;
    const author = this.author.value;
    const comment = this.comment.value;

    // Call reducer
    this.props.addComment(postId, author, comment);

    // Clear form
    this.commentForm.reset();
  }

  render() {
    return (
      <div className="comments">
        {this.props.postComments.map(this.renderComment.bind(this))}
        <form ref={(input) => { this.commentForm = input; }} className="comment-form" onSubmit={this.handleSubmit.bind(this)}>
          <input type="text" ref={(input) => { this.author = input; }} placeholder="author" />
          <input type="text" ref={(input) => { this.comment = input; }} placeholder="comment" />
          <input type="submit" hidden />
        </form>
      </div>
    );
  }
}

export default Comments;