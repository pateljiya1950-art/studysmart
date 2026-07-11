import { useEffect, useState } from "react";
import { authFetch } from "../../services/authService";

export default function RecommendedMentors() {

  const [mentors,setMentors] = useState([]);

  useEffect(()=>{
    loadMentors();
  },[])

  const loadMentors = async ()=>{

    const data = await authFetch("/student/recommended-mentors");

    setMentors(data);

  }

  return(

    <div>

      <h2>Recommended Mentors</h2>

      {mentors.map(m =>(

        <div key={m.mentorId}>

          <h3>{m.name}</h3>

          <p>Experience: {m.experienceYears} years</p>

          <p>Skill Level: {m.proficiencyLevel}</p>

        </div>

      ))}

    </div>

  )

}