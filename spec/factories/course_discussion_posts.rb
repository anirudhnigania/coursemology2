# frozen_string_literal: true
FactoryGirl.define do
  factory :course_discussion_post, class: Course::Discussion::Post.name do
    transient do
      upvoted_by []
      downvoted_by []
    end

    creator
    updater
    parent nil
    association :topic, factory: :course_discussion_topic
    text 'This is a test post'

    after(:create) do |post, evaluator|
      [*evaluator.upvoted_by].each do |user|
        post.cast_vote!(user, 1)
      end

      [*evaluator.downvoted_by].each do |user|
        post.cast_vote!(user, -1)
      end
    end
  end
end
