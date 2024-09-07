import React from "react";

const Testimonial = () => {
  const TestimonialCard = ({ name, feedback }) => (
    <article>
      <img
        src="https://cdn-icons-png.flaticon.com/512/149/149071.png"
        alt="User"
      />
      <h4>{name}</h4>
      <p>{feedback}</p>
    </article>
  );

  return (
    <div id="testimonial">
      <h2>Testimonial</h2>

      <section>
        <TestimonialCard
          name={"Syed Abdal"}
          feedback={`Talha has been an exceptional Full Stack Developer.
            He is a reliable team player, 
            I highly recommend him.`}
        />
        <TestimonialCard
          name={"Hamza Sohail"}
          feedback={`His expertise and problem-solving skills have greatly benefited our team. He's a valuable asset, and I highly recommend him.`}
        />
        <TestimonialCard
          name={"Rubab"}
          feedback={`His commitment to excellence and teamwork is remarkable. He’s a key contributor to our success."`}
        />
      </section>
    </div>
  );
};

export default Testimonial;
