angular
  .module('editor')
  .controller('NewTopicController', function ($scope,
                                              $state,
                                              $controller,
                                              topic,
                                              guides,
                                              toastr,
                                              CurrentItem) {

    CurrentItem.set(topic);

    $controller('TopicDetailController', {
      $scope: $scope,
      topic: CurrentItem.get(),
      guides: guides,
    });

    $scope.isNew = true;

    $scope.save = () => {
      return $scope
        ._save()
        .tap((topic) => $state.go('editor.home.topics.detail', topic.params()))
        .catch(Error, (error) => toastr.error(`${error.message}`))
        .catch((res) => toastr.error(`${res.data.message}`));
    };


  });