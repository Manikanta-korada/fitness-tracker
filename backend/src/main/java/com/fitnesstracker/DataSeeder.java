package com.fitnesstracker;

import com.fitnesstracker.model.DailyTarget;
import com.fitnesstracker.model.Exercise;
import com.fitnesstracker.model.Meal;
import com.fitnesstracker.repository.DailyTargetRepository;
import com.fitnesstracker.repository.ExerciseRepository;
import com.fitnesstracker.repository.MealRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    private final ExerciseRepository exerciseRepository;
    private final MealRepository mealRepository;
    private final DailyTargetRepository targetRepository;

    public DataSeeder(ExerciseRepository exerciseRepository, MealRepository mealRepository, DailyTargetRepository targetRepository) {
        this.exerciseRepository = exerciseRepository;
        this.mealRepository = mealRepository;
        this.targetRepository = targetRepository;
    }

    @Override
    public void run(String... args) {
        if (exerciseRepository.count() > 0) return;

        // Chest - Barbell
        exerciseRepository.save(new Exercise("Barbell Flat Bench Press", "Chest", false));
        exerciseRepository.save(new Exercise("Barbell Incline Bench Press", "Chest", false));
        exerciseRepository.save(new Exercise("Barbell Decline Bench Press", "Chest", false));

        // Chest - Dumbbell
        exerciseRepository.save(new Exercise("Dumbbell Flat Bench Press", "Chest", false));
        exerciseRepository.save(new Exercise("Dumbbell Incline Bench Press", "Chest", false));
        exerciseRepository.save(new Exercise("Dumbbell Decline Bench Press", "Chest", false));
        exerciseRepository.save(new Exercise("Dumbbell Flat Flyes", "Chest", false));
        exerciseRepository.save(new Exercise("Dumbbell Incline Flyes", "Chest", false));
        exerciseRepository.save(new Exercise("Dumbbell Pullover", "Chest", false));

        // Chest - Cable
        exerciseRepository.save(new Exercise("Cable Flyes (High to Low)", "Chest", false));
        exerciseRepository.save(new Exercise("Cable Flyes (Low to High)", "Chest", false));
        exerciseRepository.save(new Exercise("Cable Flyes (Middle)", "Chest", false));

        // Chest - Machine / Bodyweight
        exerciseRepository.save(new Exercise("Machine Chest Press", "Chest", false));
        exerciseRepository.save(new Exercise("Pec Deck Machine", "Chest", false));
        exerciseRepository.save(new Exercise("Chest Dips", "Chest", false));
        exerciseRepository.save(new Exercise("Push-ups", "Chest", false));
        exerciseRepository.save(new Exercise("Landmine Press", "Chest", false));

        // Back - Barbell
        exerciseRepository.save(new Exercise("Barbell Deadlift", "Back", false));
        exerciseRepository.save(new Exercise("Barbell Bent-Over Row", "Back", false));
        exerciseRepository.save(new Exercise("Barbell Pendlay Row", "Back", false));
        exerciseRepository.save(new Exercise("Barbell T-Bar Row", "Back", false));
        exerciseRepository.save(new Exercise("Barbell Rack Pulls", "Back", false));
        exerciseRepository.save(new Exercise("Barbell Pullover", "Back", false));

        // Back - Dumbbell
        exerciseRepository.save(new Exercise("Dumbbell Single-Arm Row", "Back", false));
        exerciseRepository.save(new Exercise("Dumbbell Bent-Over Row", "Back", false));
        exerciseRepository.save(new Exercise("Dumbbell Meadows Row", "Back", false));

        // Back - Cable / Machine
        exerciseRepository.save(new Exercise("Lat Pulldown (Wide Grip)", "Back", false));
        exerciseRepository.save(new Exercise("Lat Pulldown (Close Grip)", "Back", false));
        exerciseRepository.save(new Exercise("Seated Cable Row", "Back", false));
        exerciseRepository.save(new Exercise("Straight-Arm Cable Pulldown", "Back", false));
        exerciseRepository.save(new Exercise("Cable Face Pulls", "Back", false));
        exerciseRepository.save(new Exercise("Machine Row", "Back", false));

        // Back - Bodyweight
        exerciseRepository.save(new Exercise("Pull-ups", "Back", false));
        exerciseRepository.save(new Exercise("Chin-ups", "Back", false));
        exerciseRepository.save(new Exercise("Hyperextensions", "Back", false));

        // Shoulders - Barbell
        exerciseRepository.save(new Exercise("Barbell Overhead Press", "Shoulders", false));
        exerciseRepository.save(new Exercise("Barbell Behind-the-Neck Press", "Shoulders", false));
        exerciseRepository.save(new Exercise("Barbell Upright Row", "Shoulders", false));
        exerciseRepository.save(new Exercise("Barbell Shrugs", "Shoulders", false));

        // Shoulders - Dumbbell
        exerciseRepository.save(new Exercise("Dumbbell Shoulder Press", "Shoulders", false));
        exerciseRepository.save(new Exercise("Dumbbell Arnold Press", "Shoulders", false));
        exerciseRepository.save(new Exercise("Dumbbell Lateral Raises", "Shoulders", false));
        exerciseRepository.save(new Exercise("Dumbbell Front Raises", "Shoulders", false));
        exerciseRepository.save(new Exercise("Dumbbell Rear Delt Flyes", "Shoulders", false));
        exerciseRepository.save(new Exercise("Dumbbell Shrugs", "Shoulders", false));
        exerciseRepository.save(new Exercise("Dumbbell Lu Raises", "Shoulders", false));

        // Shoulders - Cable / Machine
        exerciseRepository.save(new Exercise("Cable Lateral Raises", "Shoulders", false));
        exerciseRepository.save(new Exercise("Cable Front Raises", "Shoulders", false));
        exerciseRepository.save(new Exercise("Reverse Pec Deck (Rear Delts)", "Shoulders", false));
        exerciseRepository.save(new Exercise("Machine Shoulder Press", "Shoulders", false));

        // Legs - Barbell
        exerciseRepository.save(new Exercise("Barbell Back Squat", "Legs", false));
        exerciseRepository.save(new Exercise("Barbell Front Squat", "Legs", false));
        exerciseRepository.save(new Exercise("Barbell Romanian Deadlift", "Legs", false));
        exerciseRepository.save(new Exercise("Barbell Stiff-Leg Deadlift", "Legs", false));
        exerciseRepository.save(new Exercise("Barbell Sumo Deadlift", "Legs", false));
        exerciseRepository.save(new Exercise("Barbell Hip Thrust", "Legs", false));
        exerciseRepository.save(new Exercise("Barbell Lunges", "Legs", false));
        exerciseRepository.save(new Exercise("Barbell Calf Raises", "Legs", false));

        // Legs - Dumbbell
        exerciseRepository.save(new Exercise("Dumbbell Goblet Squat", "Legs", false));
        exerciseRepository.save(new Exercise("Dumbbell Lunges", "Legs", false));
        exerciseRepository.save(new Exercise("Dumbbell Walking Lunges", "Legs", false));
        exerciseRepository.save(new Exercise("Dumbbell Bulgarian Split Squats", "Legs", false));
        exerciseRepository.save(new Exercise("Dumbbell Romanian Deadlift", "Legs", false));
        exerciseRepository.save(new Exercise("Dumbbell Step-ups", "Legs", false));
        exerciseRepository.save(new Exercise("Dumbbell Calf Raises", "Legs", false));

        // Legs - Machine
        exerciseRepository.save(new Exercise("Leg Press", "Legs", false));
        exerciseRepository.save(new Exercise("Hack Squat Machine", "Legs", false));
        exerciseRepository.save(new Exercise("Smith Machine Squat", "Legs", false));
        exerciseRepository.save(new Exercise("Leg Extensions", "Legs", false));
        exerciseRepository.save(new Exercise("Leg Curls (Lying)", "Legs", false));
        exerciseRepository.save(new Exercise("Leg Curls (Seated)", "Legs", false));
        exerciseRepository.save(new Exercise("Seated Calf Raises", "Legs", false));
        exerciseRepository.save(new Exercise("Leg Press Calf Raises", "Legs", false));
        exerciseRepository.save(new Exercise("Glute Kickback Machine", "Legs", false));
        exerciseRepository.save(new Exercise("Hip Adductor Machine", "Legs", false));
        exerciseRepository.save(new Exercise("Hip Abductor Machine", "Legs", false));

        // Legs - Bodyweight
        exerciseRepository.save(new Exercise("Bodyweight Squat", "Legs", false));
        exerciseRepository.save(new Exercise("Sissy Squat", "Legs", false));

        // Biceps - Barbell
        exerciseRepository.save(new Exercise("Barbell Bicep Curl", "Biceps", false));
        exerciseRepository.save(new Exercise("Barbell Preacher Curl", "Biceps", false));
        exerciseRepository.save(new Exercise("EZ-Bar Curl", "Biceps", false));
        exerciseRepository.save(new Exercise("EZ-Bar Preacher Curl", "Biceps", false));
        exerciseRepository.save(new Exercise("Barbell Reverse Curl", "Biceps", false));

        // Biceps - Dumbbell
        exerciseRepository.save(new Exercise("Dumbbell Bicep Curl", "Biceps", false));
        exerciseRepository.save(new Exercise("Dumbbell Hammer Curl", "Biceps", false));
        exerciseRepository.save(new Exercise("Dumbbell Incline Curl", "Biceps", false));
        exerciseRepository.save(new Exercise("Dumbbell Concentration Curl", "Biceps", false));
        exerciseRepository.save(new Exercise("Dumbbell Preacher Curl", "Biceps", false));
        exerciseRepository.save(new Exercise("Dumbbell Spider Curl", "Biceps", false));
        exerciseRepository.save(new Exercise("Dumbbell Cross-Body Curl", "Biceps", false));

        // Biceps - Cable
        exerciseRepository.save(new Exercise("Cable Bicep Curl", "Biceps", false));
        exerciseRepository.save(new Exercise("Cable Hammer Curl (Rope)", "Biceps", false));
        exerciseRepository.save(new Exercise("Cable Overhead Curl", "Biceps", false));

        // Triceps - Barbell
        exerciseRepository.save(new Exercise("Barbell Close-Grip Bench Press", "Triceps", false));
        exerciseRepository.save(new Exercise("Barbell Skull Crushers (EZ-Bar)", "Triceps", false));
        exerciseRepository.save(new Exercise("Barbell Overhead Tricep Extension", "Triceps", false));

        // Triceps - Dumbbell
        exerciseRepository.save(new Exercise("Dumbbell Overhead Tricep Extension", "Triceps", false));
        exerciseRepository.save(new Exercise("Dumbbell Kickback", "Triceps", false));
        exerciseRepository.save(new Exercise("Dumbbell Skull Crushers", "Triceps", false));

        // Triceps - Cable
        exerciseRepository.save(new Exercise("Cable Tricep Pushdown (Bar)", "Triceps", false));
        exerciseRepository.save(new Exercise("Cable Tricep Pushdown (Rope)", "Triceps", false));
        exerciseRepository.save(new Exercise("Cable Overhead Tricep Extension", "Triceps", false));

        // Triceps - Bodyweight
        exerciseRepository.save(new Exercise("Tricep Dips", "Triceps", false));
        exerciseRepository.save(new Exercise("Bench Dips", "Triceps", false));
        exerciseRepository.save(new Exercise("Diamond Push-ups", "Triceps", false));

        // Forearms
        exerciseRepository.save(new Exercise("Barbell Wrist Curl", "Forearms", false));
        exerciseRepository.save(new Exercise("Barbell Reverse Wrist Curl", "Forearms", false));
        exerciseRepository.save(new Exercise("Dumbbell Wrist Curl", "Forearms", false));
        exerciseRepository.save(new Exercise("Dumbbell Reverse Wrist Curl", "Forearms", false));
        exerciseRepository.save(new Exercise("Behind-the-Back Barbell Wrist Curl", "Forearms", false));
        exerciseRepository.save(new Exercise("Farmer's Walk", "Forearms", false));
        exerciseRepository.save(new Exercise("Plate Pinch Hold", "Forearms", false));
        exerciseRepository.save(new Exercise("Dead Hang", "Forearms", false));
        exerciseRepository.save(new Exercise("Towel Pull-ups (Grip)", "Forearms", false));
        exerciseRepository.save(new Exercise("Wrist Roller", "Forearms", false));

        // Core
        exerciseRepository.save(new Exercise("Plank", "Core", false));
        exerciseRepository.save(new Exercise("Side Plank", "Core", false));
        exerciseRepository.save(new Exercise("Hanging Leg Raises", "Core", false));
        exerciseRepository.save(new Exercise("Hanging Knee Raises", "Core", false));
        exerciseRepository.save(new Exercise("Cable Crunches", "Core", false));
        exerciseRepository.save(new Exercise("Cable Woodchoppers", "Core", false));
        exerciseRepository.save(new Exercise("Ab Wheel Rollouts", "Core", false));
        exerciseRepository.save(new Exercise("Bicycle Crunches", "Core", false));
        exerciseRepository.save(new Exercise("Lying Leg Raises", "Core", false));
        exerciseRepository.save(new Exercise("Decline Sit-ups", "Core", false));
        exerciseRepository.save(new Exercise("Russian Twists", "Core", false));
        exerciseRepository.save(new Exercise("Dead Bug", "Core", false));
        exerciseRepository.save(new Exercise("Mountain Climbers", "Core", false));
        exerciseRepository.save(new Exercise("Dragon Flags", "Core", false));
        exerciseRepository.save(new Exercise("Weighted Decline Sit-ups", "Core", false));

        // Cardio
        exerciseRepository.save(new Exercise("Cycling (Outdoor)", "Cardio", false));
        exerciseRepository.save(new Exercise("Cycling (Stationary)", "Cardio", false));
        exerciseRepository.save(new Exercise("Running (Outdoor)", "Cardio", false));
        exerciseRepository.save(new Exercise("Running (Treadmill)", "Cardio", false));
        exerciseRepository.save(new Exercise("Walking", "Cardio", false));
        exerciseRepository.save(new Exercise("Incline Walking (Treadmill)", "Cardio", false));
        exerciseRepository.save(new Exercise("Swimming", "Cardio", false));
        exerciseRepository.save(new Exercise("Jump Rope", "Cardio", false));
        exerciseRepository.save(new Exercise("Rowing Machine", "Cardio", false));
        exerciseRepository.save(new Exercise("Elliptical", "Cardio", false));
        exerciseRepository.save(new Exercise("Stair Climber", "Cardio", false));
        exerciseRepository.save(new Exercise("Battle Ropes", "Cardio", false));
        exerciseRepository.save(new Exercise("Burpees", "Cardio", false));
        exerciseRepository.save(new Exercise("Sprints", "Cardio", false));
        exerciseRepository.save(new Exercise("Box Jumps", "Cardio", false));

        // Meals
        mealRepository.save(new Meal("Chicken Rice Bowl", 550, 45, 60, 12, false));
        mealRepository.save(new Meal("Oatmeal with Banana", 350, 12, 55, 8, false));
        mealRepository.save(new Meal("Protein Shake", 200, 40, 10, 3, false));
        mealRepository.save(new Meal("Grilled Salmon with Veggies", 450, 38, 15, 25, false));
        mealRepository.save(new Meal("Eggs & Toast", 400, 22, 35, 18, false));
        mealRepository.save(new Meal("Greek Yogurt with Berries", 180, 18, 20, 4, false));
        mealRepository.save(new Meal("Grilled Chicken Salad", 380, 35, 20, 16, false));
        mealRepository.save(new Meal("Tuna Sandwich", 420, 30, 40, 14, false));
        mealRepository.save(new Meal("Brown Rice & Lentils", 400, 18, 65, 5, false));
        mealRepository.save(new Meal("Peanut Butter Toast", 300, 10, 30, 16, false));
        mealRepository.save(new Meal("Steak with Sweet Potato", 600, 42, 45, 22, false));
        mealRepository.save(new Meal("Pasta with Meat Sauce", 550, 28, 70, 15, false));

        DailyTarget target = new DailyTarget();
        target.setCalorieTarget(2500);
        target.setProteinTargetG(150);
        target.setCarbsTargetG(300);
        target.setFatTargetG(70);
        targetRepository.save(target);
    }
}
