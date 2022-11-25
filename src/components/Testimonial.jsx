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
          name={"Talha"}
          feedback={"I will be a Full Stack Developer."}
        />
        <TestimonialCard
          name={"Rubab"}
          feedback={"I will be a Rich Girl Onyday."}
        />
        <TestimonialCard
          name={"Abdal"}
          feedback={"I will be a Full Stack Developer."}
        />
        
      </section>
    </div>
  );
};

export default Testimonial;
